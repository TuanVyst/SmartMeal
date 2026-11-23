using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class SubscriptionRepo : ISubscriptionRepo
    {
        private readonly AppDbContext _ctx;

        /// <summary>Safety cap for CSV export.</summary>
        private const int MaxExportRows = 50000;

        /// <summary>Safety cap for PayOS backfill candidate scanning.</summary>
        private const int MaxSyncScanRows = 2000;

        public SubscriptionRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Subscription>> GetAllSubscriptions()
        {
            return await _ctx.Subscriptions
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<List<Subscription>> GetSubscriptionsByAccountId(Guid accountId)
        {
            return await _ctx.Subscriptions
                .Where(i => !i.IsDeleted && i.Account_id == accountId)
                .ToListAsync();
        }

        public async Task<Subscription?> GetSubscriptionById(Guid id)
            => await _ctx.Subscriptions
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Sub_id == id);

        public async Task<Subscription> CreateSubscription(Subscription subscription)
        {
            _ctx.Subscriptions.Add(subscription);
            await _ctx.SaveChangesAsync();
            return subscription;
        }

        public async Task<Subscription> UpdateSubscription(Subscription subscription)
        {
            _ctx.Subscriptions.Update(subscription);
            await _ctx.SaveChangesAsync();
            return subscription;
        }

        public async Task<Subscription> SoftDeleteSubscription(Guid id)
        {
            var subscription = _ctx.Subscriptions.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Sub_id == id);
            if (subscription == null)
                throw new Exception("Subscription not found");
            subscription.IsDeleted = true;
            _ctx.Subscriptions.Update(subscription);
            await _ctx.SaveChangesAsync();
            return subscription;
        }

        // ------------------------------------------------------------------
        // Admin transaction dashboard
        // ------------------------------------------------------------------

        /// <summary>Converts a Vietnam calendar date to the equivalent UTC instant at 00:00 VN.</summary>
        public static DateTime ToVnStartUtc(DateTime d)
            => DateTime.SpecifyKind(d.Date.AddHours(-7), DateTimeKind.Utc);

        private IQueryable<Subscription> BuildFilteredQuery(AdminTransactionFilter? filter)
        {
            filter ??= new AdminTransactionFilter();

            var query = _ctx.Subscriptions.AsNoTracking();

            if (!filter.IncludeDeleted)
                query = query.Where(s => !s.IsDeleted);

            // ---- search ----
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = $"%{filter.Search.Trim()}%";
                query = query.Where(s =>
                    EF.Functions.ILike(s.PaymentRef ?? string.Empty, term) ||
                    EF.Functions.ILike(s.PaymentLinkId ?? string.Empty, term) ||
                    EF.Functions.ILike(s.BankReference ?? string.Empty, term) ||
                    EF.Functions.ILike(s.Account.Name ?? string.Empty, term) ||
                    EF.Functions.ILike(s.Account.Username ?? string.Empty, term) ||
                    EF.Functions.ILike(s.Account.Email ?? string.Empty, term) ||
                    EF.Functions.ILike(s.Account.Phone ?? string.Empty, term));
            }

            // ---- status ----
            if (!string.IsNullOrWhiteSpace(filter.Status) &&
                !string.Equals(filter.Status, "all", StringComparison.OrdinalIgnoreCase))
            {
                var status = filter.Status.Trim().ToLowerInvariant();
                query = query.Where(s => s.Status.ToLower() == status);
            }

            // ---- source ----
            var source = filter.Source?.Trim().ToLowerInvariant();
            if (source == "admin_grant" || source == "admingrant")
            {
                query = query.Where(IsAdminGrantExpression);
            }
            else if (source == "payos")
            {
                query = query.Where(s =>
                    !(s.PaymentProvider == "AdminGrant" ||
                      (s.PaymentRef != null && s.PaymentRef.StartsWith("ADMIN_GRANT_"))));
            }

            // ---- plan / account ----
            if (filter.PlanId.HasValue && filter.PlanId.Value != Guid.Empty)
                query = query.Where(s => s.Plan_id == filter.PlanId.Value);

            if (filter.AccountId.HasValue && filter.AccountId.Value != Guid.Empty)
                query = query.Where(s => s.Account_id == filter.AccountId.Value);

            // ---- VN calendar date range (on the row creation timestamp) ----
            if (filter.FromDate.HasValue)
            {
                var fromUtc = ToVnStartUtc(filter.FromDate.Value);
                query = query.Where(s => s.CreatedAt >= fromUtc);
            }

            if (filter.ToDate.HasValue)
            {
                var toUtcExclusive = ToVnStartUtc(filter.ToDate.Value.AddDays(1));
                query = query.Where(s => s.CreatedAt < toUtcExclusive);
            }

            return query;
        }

        private static readonly System.Linq.Expressions.Expression<Func<Subscription, bool>> IsAdminGrantExpression =
            s => s.PaymentProvider == "AdminGrant" ||
                 (s.PaymentRef != null && s.PaymentRef.StartsWith("ADMIN_GRANT_"));

        private static readonly System.Linq.Expressions.Expression<Func<Subscription, bool>> IsSuccessfulExpression =
            s => (s.Status == "active" || s.Status == "expired" || s.Status == "superseded") &&
                 s.PricePaid > 0 &&
                 !(s.PaymentProvider == "AdminGrant" ||
                   (s.PaymentRef != null && s.PaymentRef.StartsWith("ADMIN_GRANT_")));

        private static IQueryable<Subscription> ApplySort(IQueryable<Subscription> query, AdminTransactionFilter filter)
        {
            var asc = string.Equals(filter.SortDir, "asc", StringComparison.OrdinalIgnoreCase);
            var sortBy = (filter.SortBy ?? "createdAt").Trim().ToLowerInvariant();

            query = sortBy switch
            {
                "paidat" or "paid_at" => asc
                    ? query.OrderBy(s => s.PaidAt == null).ThenBy(s => s.PaidAt).ThenByDescending(s => s.Sub_id)
                    : query.OrderBy(s => s.PaidAt == null).ThenByDescending(s => s.PaidAt).ThenByDescending(s => s.Sub_id),
                "amount" or "pricepaid" or "price" => asc
                    ? query.OrderBy(s => s.PricePaid).ThenByDescending(s => s.Sub_id)
                    : query.OrderByDescending(s => s.PricePaid).ThenByDescending(s => s.Sub_id),
                _ => asc
                    ? query.OrderBy(s => s.CreatedAt).ThenByDescending(s => s.Sub_id)
                    : query.OrderByDescending(s => s.CreatedAt).ThenByDescending(s => s.Sub_id)
            };

            return query;
        }

        public async Task<(List<Subscription> Items, int Total)> GetPagedSubscriptionsWithDetailsAsync(AdminTransactionFilter filter)
        {
            filter ??= new AdminTransactionFilter();

            var page = filter.Page < 1 ? 1 : filter.Page;
            var pageSize = filter.PageSize < 1 ? 20 : filter.PageSize;
            if (pageSize > 200) pageSize = 200;

            var query = BuildFilteredQuery(filter);

            var total = await query.CountAsync();

            var items = await ApplySort(query, filter)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(s => s.Account)
                .Include(s => s.Plan)
                .Include(s => s.GrantedByAccount)
                .ToListAsync();

            return (items, total);
        }

        public async Task<List<Subscription>> GetAllSubscriptionsWithDetailsAsync(AdminTransactionFilter filter)
        {
            filter ??= new AdminTransactionFilter();

            return await ApplySort(BuildFilteredQuery(filter), filter)
                .Take(MaxExportRows)
                .Include(s => s.Account)
                .Include(s => s.Plan)
                .Include(s => s.GrantedByAccount)
                .ToListAsync();
        }

        public async Task<Subscription?> GetSubscriptionWithDetailsAsync(Guid id)
            => await _ctx.Subscriptions
                .AsNoTracking()
                .Include(s => s.Account)
                .Include(s => s.Plan)
                .Include(s => s.GrantedByAccount)
                .FirstOrDefaultAsync(s => s.Sub_id == id);

        public async Task<Subscription?> GetByPaymentRefAsync(string paymentRef)
        {
            if (string.IsNullOrWhiteSpace(paymentRef))
                return null;

            return await _ctx.Subscriptions
                .Where(s => !s.IsDeleted && s.PaymentRef == paymentRef)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Subscription>> GetSubscriptionsForPayOsSyncAsync(
            DateTime fromUtc,
            DateTime toUtcExclusive,
            List<string>? statuses,
            List<Guid>? subIds,
            int limit,
            int offset,
            bool skipFullEvidence)
        {
            if (limit < 1) limit = 1;
            if (limit > 100) limit = 100;
            if (offset < 0) offset = 0;

            var query = _ctx.Subscriptions
                .Include(s => s.Plan)
                .Where(s => !s.IsDeleted)
                .Where(s => s.CreatedAt >= fromUtc && s.CreatedAt < toUtcExclusive)
                .Where(s => !(s.PaymentProvider == "AdminGrant" ||
                              (s.PaymentRef != null && s.PaymentRef.StartsWith("ADMIN_GRANT_"))))
                .Where(s => s.PaymentRef != null && s.PaymentRef != "")
                // free / non-payable rows carry no PayOS evidence
                .Where(s => s.Plan.Price > 0 || s.PricePaid > 0);

            if (statuses != null && statuses.Count > 0)
            {
                var normalized = statuses
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim().ToLowerInvariant())
                    .Distinct()
                    .ToList();

                if (normalized.Count > 0)
                    query = query.Where(s => normalized.Contains(s.Status.ToLower()));
            }

            if (subIds != null && subIds.Count > 0)
            {
                var ids = subIds.Where(id => id != Guid.Empty).Distinct().ToList();
                if (ids.Count > 0)
                    query = query.Where(s => ids.Contains(s.Sub_id));
            }

            if (skipFullEvidence)
            {
                // Already fully reconciled -> no need to hit PayOS again.
                // Mirrors PaymentEvidenceHelper.ComputeEvidenceLevel == "full".
                query = query.Where(s =>
                    s.BankReference == null ||
                    s.PaidAt == null ||
                    s.PaymentLinkId == null ||
                    s.ProviderStatus != "PAID");
            }

            // Oldest first so repeated batched runs make progress.
            var scanCap = Math.Clamp(limit * 20, 100, MaxSyncScanRows);

            var pageQuery = query
                .OrderBy(s => s.CreatedAt)
                .ThenBy(s => s.Sub_id);

            var rows = await (offset > 0 ? pageQuery.Skip(offset) : pageQuery)
                .Take(scanCap)
                .ToListAsync();

            // PaymentRef must be a numeric PayOS order code; parse in memory (not translatable).
            return rows
                .Where(s => long.TryParse(s.PaymentRef, out _))
                .Take(limit)
                .ToList();
        }

        public async Task<AdminTransactionSummaryDto> GetTransactionSummaryAsync(AdminTransactionFilter filter)
        {
            var query = BuildFilteredQuery(filter);

            var pendingCount = await query.CountAsync(s => s.Status == "pending");
            var cancelledCount = await query.CountAsync(s => s.Status == "cancelled");
            var expiredCount = await query.CountAsync(s => s.Status == "expired");

            var successQuery = query.Where(IsSuccessfulExpression);
            var successfulCount = await successQuery.CountAsync();
            var totalRevenue = await successQuery.Select(s => s.PricePaid).SumAsync();

            var grantQuery = query.Where(IsAdminGrantExpression);
            var adminGrantCount = await grantQuery.CountAsync();
            var adminGrantValue = await grantQuery.Select(s => s.PricePaid).SumAsync();

            // TotalTransactions == every row matching the filter (deleted only when requested).
            var totalTransactions = await query.CountAsync();

            return new AdminTransactionSummaryDto
            {
                TotalTransactions = totalTransactions,
                SuccessfulCount = successfulCount,
                PendingCount = pendingCount,
                CancelledCount = cancelledCount,
                ExpiredCount = expiredCount,
                TotalRevenue = totalRevenue,
                AdminGrantCount = adminGrantCount,
                AdminGrantValue = adminGrantValue,
                AvgOrderValue = successfulCount > 0 ? Math.Round(totalRevenue / successfulCount, 2) : 0
            };
        }
    }
}
