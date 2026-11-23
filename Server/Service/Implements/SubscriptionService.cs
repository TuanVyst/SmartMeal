using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using BusinessObject.Helpers;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ISubscriptionRepo _subscriptionRepo;
        private readonly IPlanRepo _planRepo;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SubscriptionService> _logger;

        public SubscriptionService(
            ISubscriptionRepo subscriptionRepo,
            IPlanRepo planRepo,
            IConfiguration configuration,
            ILogger<SubscriptionService> logger)
        {
            _subscriptionRepo = subscriptionRepo;
            _planRepo = planRepo;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<List<SubscriptionResponseDto>> GetAllSubscriptions()
        {
            var items = await _subscriptionRepo.GetAllSubscriptions();
            return items.Select(MapToDto).ToList();
        }

        public async Task<List<SubscriptionResponseDto>> GetSubscriptionsByAccountId(Guid accountId)
        {
            var items = await _subscriptionRepo.GetSubscriptionsByAccountId(accountId);
            return items.Select(MapToDto).ToList();
        }

        public async Task<SubscriptionResponseDto?> GetSubscriptionById(Guid id)
        {
            var item = await _subscriptionRepo.GetSubscriptionById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<SubscriptionResponseDto> CreateSubscription(SubscriptionRequest request)
        {
            var plan = await _planRepo.GetPlanById(request.Plan_id);
            if (plan == null)
                throw new InvalidOperationException("Plan not found");

            var startDate = request.StartDate == default ? DateTime.UtcNow : request.StartDate;
            DateTime? endDate = null;
            if (plan.Duration > 0)
                endDate = startDate.AddDays(plan.Duration);

            var paymentProvider = string.IsNullOrWhiteSpace(request.PaymentProvider)
                ? "PayOS"
                : request.PaymentProvider.Trim();

            var newItem = new Subscription
            {
                Sub_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                Plan_id = request.Plan_id,
                StartDate = startDate,
                EndDate = endDate,
                Status = request.Status,
                PaymentRef = request.PaymentRef,
                PricePaid = request.PricePaid > 0 ? request.PricePaid : plan.Price,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow,
                PaidAt = null,
                PaymentProvider = paymentProvider,
                ProviderStatus = "PENDING",
                PaymentLinkId = request.PaymentLinkId,
                PaymentDescription = request.PaymentDescription
            };

            var result = await _subscriptionRepo.CreateSubscription(newItem);
            _logger.LogInformation("Subscription '{Sub_id}' created successfully", newItem.Sub_id);
            return MapToDto(result);
        }

        public async Task<SubscriptionResponseDto> UpdateSubscription(Guid id, SubscriptionRequest request)
        {
            var existingItem = await _subscriptionRepo.GetSubscriptionById(id);
            if (existingItem == null)
                throw new KeyNotFoundException($"Subscription with id {id} not found");

            var plan = await _planRepo.GetPlanById(request.Plan_id);
            if (plan == null)
                throw new InvalidOperationException("Plan not found");

            var startDate = request.StartDate == default ? existingItem.StartDate : request.StartDate;
            DateTime? endDate = null;
            if (plan.Duration > 0)
                endDate = startDate.AddDays(plan.Duration);

            existingItem.Plan_id = request.Plan_id;
            existingItem.StartDate = startDate;
            existingItem.EndDate = endDate;
            existingItem.Status = request.Status;
            existingItem.PaymentRef = request.PaymentRef;
            if (request.PricePaid > 0) existingItem.PricePaid = request.PricePaid;

            // Preserve/complete payment metadata without wiping reconciliation evidence.
            if (!string.IsNullOrWhiteSpace(request.PaymentProvider))
                existingItem.PaymentProvider = request.PaymentProvider.Trim();
            if (!string.IsNullOrWhiteSpace(request.PaymentLinkId))
                existingItem.PaymentLinkId = request.PaymentLinkId;
            if (!string.IsNullOrWhiteSpace(request.PaymentDescription))
                existingItem.PaymentDescription = request.PaymentDescription;
            if (existingItem.CreatedAt == default)
                existingItem.CreatedAt = DateTime.UtcNow;

            var result = await _subscriptionRepo.UpdateSubscription(existingItem);
            _logger.LogInformation("Subscription '{Sub_id}' updated successfully", existingItem.Sub_id);
            return MapToDto(result);
        }

        public async Task<bool> HasFeatureAsync(Guid accountId, string featureKey)
        {
            // Temporary: open all Pro features to every account (toggle via appsettings)
            if (_configuration.GetValue<bool>("FeatureFlags:OpenProFeaturesForAll", false))
                return true;

            var now = DateTime.UtcNow;
            var subs = await _subscriptionRepo.GetSubscriptionsByAccountId(accountId);
            var activeSubs = subs.Where(s =>
                !s.IsDeleted &&
                string.Equals(s.Status, "active", StringComparison.OrdinalIgnoreCase) &&
                (!s.EndDate.HasValue || s.EndDate.Value > now));

            foreach (var sub in activeSubs)
            {
                var plan = await _planRepo.GetPlanById(sub.Plan_id);
                if (PlanHasFeature(plan, featureKey))
                    return true;
            }

            return false;
        }

        private static bool PlanHasFeature(Plan? plan, string featureKey)
        {
            if (plan == null || string.IsNullOrWhiteSpace(plan.Features)) return false;
            try
            {
                var features = System.Text.Json.JsonSerializer.Deserialize<List<string>>(plan.Features);
                return features != null && features.Any(f => string.Equals(f, featureKey, StringComparison.OrdinalIgnoreCase));
            }
            catch (System.Text.Json.JsonException)
            {
                return plan.Features.Contains(featureKey, StringComparison.OrdinalIgnoreCase);
            }
        }

        public async Task<SubscriptionResponseDto> SoftDeleteSubscription(Guid id)
        {
            var result = await _subscriptionRepo.SoftDeleteSubscription(id);
            return MapToDto(result);
        }

        public async Task<SubscriptionResponseDto> GrantSubscriptionByAdminAsync(AdminGrantSubscriptionRequest request)
        {
            if (request.Account_id == Guid.Empty)
                throw new ArgumentException("Account_id không hợp lệ");

            var plan = await _planRepo.GetPlanById(request.Plan_id);
            if (plan == null)
                throw new InvalidOperationException("Không tìm thấy gói cước (Plan)");

            var now = DateTime.UtcNow;
            int rolloverDays = 0;

            var userSubs = await _subscriptionRepo.GetSubscriptionsByAccountId(request.Account_id);

            // Cộng dồn ngày còn lại từ gói active hiện tại (nếu có) và đánh dấu superseded
            var activeSubs = userSubs
                .Where(s => !s.IsDeleted && string.Equals(s.Status, "active", StringComparison.OrdinalIgnoreCase))
                .ToList();

            foreach (var activeSub in activeSubs)
            {
                if (activeSub.EndDate.HasValue && activeSub.EndDate.Value > now)
                {
                    double remaining = (activeSub.EndDate.Value - now).TotalDays;
                    if (remaining > 0)
                    {
                        rolloverDays += (int)Math.Ceiling(remaining);
                    }
                }
                activeSub.Status = "superseded";
                await _subscriptionRepo.UpdateSubscription(activeSub);
            }

            // Hủy các giao dịch pending đang bị treo của người dùng
            var pendingSubs = userSubs
                .Where(s => !s.IsDeleted && string.Equals(s.Status, "pending", StringComparison.OrdinalIgnoreCase))
                .ToList();

            foreach (var pendingSub in pendingSubs)
            {
                pendingSub.Status = "cancelled";
                await _subscriptionRepo.UpdateSubscription(pendingSub);
            }

            DateTime? endDate = null;
            if (plan.Duration > 0)
            {
                endDate = now.AddDays(plan.Duration + rolloverDays);
            }

            var newSub = new Subscription
            {
                Sub_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                Plan_id = request.Plan_id,
                StartDate = now,
                EndDate = endDate,
                Status = "active",
                PaymentRef = string.IsNullOrWhiteSpace(request.PaymentRef)
                    ? $"ADMIN_GRANT_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}"
                    : request.PaymentRef.Trim(),
                PricePaid = request.PricePaid ?? plan.Price,
                IsDeleted = false,
                CreatedAt = now,
                PaidAt = null,
                PaymentProvider = "AdminGrant",
                ProviderStatus = null,
                EvidenceSource = "admin",
                EvidenceSyncedAt = now,
                GrantedByAccountId = request.GrantedByAccountId
            };

            var created = await _subscriptionRepo.CreateSubscription(newSub);
            _logger.LogInformation(
                "Admin granted subscription {SubId} (Plan={PlanId}) to account {AccountId}. Duration={Duration}d, Rollover={Rollover}d, EndDate={EndDate}",
                created.Sub_id, request.Plan_id, request.Account_id, plan.Duration, rolloverDays, endDate);

            return MapToDto(created);
        }

        public async Task<bool> RevokeActiveSubscriptionByAdminAsync(Guid accountId)
        {
            var now = DateTime.UtcNow;
            var userSubs = await _subscriptionRepo.GetSubscriptionsByAccountId(accountId);
            var activeSubs = userSubs
                .Where(s => !s.IsDeleted && string.Equals(s.Status, "active", StringComparison.OrdinalIgnoreCase) && (!s.EndDate.HasValue || s.EndDate.Value > now))
                .ToList();

            if (activeSubs.Count == 0)
                return false;

            foreach (var sub in activeSubs)
            {
                sub.Status = "cancelled";
                sub.EndDate = now;
                sub.ProviderStatus ??= "CANCELLED";
                await _subscriptionRepo.UpdateSubscription(sub);
            }

            _logger.LogInformation("Admin revoked {Count} active subscription(s) for account {AccountId}", activeSubs.Count, accountId);
            return true;
        }

        // ------------------------------------------------------------------
        // Admin transaction dashboard
        // ------------------------------------------------------------------

        public async Task<AdminTransactionListResponse> GetAdminTransactionsAsync(AdminTransactionFilter filter, CancellationToken ct = default)
        {
            filter ??= new AdminTransactionFilter();

            var page = filter.Page < 1 ? 1 : filter.Page;
            var pageSize = filter.PageSize < 1 ? 20 : filter.PageSize;
            if (pageSize > 200) pageSize = 200;
            filter.Page = page;
            filter.PageSize = pageSize;

            var (items, total) = await _subscriptionRepo.GetPagedSubscriptionsWithDetailsAsync(filter);
            var summary = await _subscriptionRepo.GetTransactionSummaryAsync(filter);

            return new AdminTransactionListResponse
            {
                Items = items.Select(MapToAdminTransactionDto).ToList(),
                Total = total,
                Page = page,
                PageSize = pageSize,
                TotalPages = total <= 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize),
                Summary = summary
            };
        }

        public async Task<AdminTransactionDetailDto?> GetAdminTransactionDetailAsync(Guid id)
        {
            var entity = await _subscriptionRepo.GetSubscriptionWithDetailsAsync(id);
            if (entity == null) return null;

            var baseDto = MapToAdminTransactionDto(entity);
            return new AdminTransactionDetailDto
            {
                SubId = baseDto.SubId,
                OrderCode = baseDto.OrderCode,
                PaymentLinkId = baseDto.PaymentLinkId,
                BankReference = baseDto.BankReference,
                Source = baseDto.Source,
                Status = baseDto.Status,
                ProviderStatus = baseDto.ProviderStatus,
                PricePaid = baseDto.PricePaid,
                PlanPrice = baseDto.PlanPrice,
                PlanName = baseDto.PlanName,
                PlanDurationDays = baseDto.PlanDurationDays,
                PlanTier = baseDto.PlanTier,
                AccountId = baseDto.AccountId,
                AccountName = baseDto.AccountName,
                AccountUsername = baseDto.AccountUsername,
                AccountEmail = baseDto.AccountEmail,
                AccountPhone = baseDto.AccountPhone,
                AccountCreatedAt = baseDto.AccountCreatedAt,
                CreatedAt = baseDto.CreatedAt,
                PaidAt = baseDto.PaidAt,
                StartDate = baseDto.StartDate,
                EndDate = baseDto.EndDate,
                PaymentDescription = baseDto.PaymentDescription,
                EvidenceLevel = baseDto.EvidenceLevel,
                EvidenceSyncedAt = baseDto.EvidenceSyncedAt,
                EvidenceSource = baseDto.EvidenceSource,
                IsAdminGrant = baseDto.IsAdminGrant,
                GrantedByAccountId = baseDto.GrantedByAccountId,
                GrantedByName = baseDto.GrantedByName,
                RawEvidence = entity.RawEvidence,
                IsDeleted = entity.IsDeleted,
                AccountIsActive = entity.Account?.IsActive ?? false
            };
        }

        private const string CsvHeader =
            "Mã đơn,Mã link PayOS,Mã GD ngân hàng,Nguồn,Trạng thái,Tên người mua,Username,Email,SĐT,Tên gói,Giá gói,Thời hạn (ngày),Số tiền đã trả,Ngày tạo,Ngày thanh toán,Ngày bắt đầu,Ngày kết thúc,Nội dung chuyển khoản,Mức bằng chứng,Admin cấp";

        public async Task<string> BuildAdminTransactionsCsvAsync(AdminTransactionFilter filter)
        {
            var items = await _subscriptionRepo.GetAllSubscriptionsWithDetailsAsync(filter);
            var sb = new StringBuilder();
            sb.Append(CsvHeader).Append("\r\n");

            foreach (var entity in items)
            {
                var dto = MapToAdminTransactionDto(entity);

                var fields = new[]
                {
                    dto.OrderCode,
                    dto.PaymentLinkId,
                    dto.BankReference,
                    dto.Source,
                    dto.Status,
                    dto.AccountName,
                    dto.AccountUsername,
                    dto.AccountEmail,
                    dto.AccountPhone,
                    dto.PlanName,
                    FormatNumber(dto.PlanPrice),
                    dto.PlanDurationDays.ToString(CultureInfo.InvariantCulture),
                    FormatNumber(dto.PricePaid),
                    FormatVnDate(dto.CreatedAt),
                    FormatVnDate(dto.PaidAt),
                    FormatVnDate(dto.StartDate),
                    FormatVnDate(dto.EndDate),
                    dto.PaymentDescription,
                    dto.EvidenceLevel,
                    dto.GrantedByName
                };

                sb.Append(string.Join(",", fields.Select(EscapeCsv))).Append("\r\n");
            }

            return sb.ToString();
        }

        private static string FormatNumber(double value)
            => value.ToString("0.##", CultureInfo.InvariantCulture);

        /// <summary>Dates are exported in Vietnam local time (UTC+7), minute precision.</summary>
        private static string FormatVnDate(DateTime? value)
            => value.HasValue
                ? value.Value.AddHours(7).ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture)
                : string.Empty;

        private static string EscapeCsv(string? value)
        {
            if (string.IsNullOrEmpty(value)) return string.Empty;

            // Prevent spreadsheet formula injection from user-controlled fields
            // (account name, transfer description, ...).
            if (value[0] is '=' or '+' or '-' or '@' or '\t' or '\r')
                value = "'" + value;

            var needsQuotes = value.IndexOfAny(new[] { ',', '"', '\r', '\n' }) >= 0;
            if (!needsQuotes) return value;

            return "\"" + value.Replace("\"", "\"\"") + "\"";
        }

        private AdminTransactionDto MapToAdminTransactionDto(Subscription entity)
        {
            var isAdminGrant = PaymentEvidenceHelper.IsAdminGrant(entity);

            return new AdminTransactionDto
            {
                SubId = entity.Sub_id,
                OrderCode = entity.PaymentRef,
                PaymentLinkId = entity.PaymentLinkId,
                BankReference = entity.BankReference,
                Source = isAdminGrant ? "AdminGrant" : "PayOS",
                Status = entity.Status,
                ProviderStatus = entity.ProviderStatus,
                PricePaid = entity.PricePaid,
                PlanPrice = entity.Plan?.Price ?? 0,
                PlanName = entity.Plan?.Name,
                PlanDurationDays = entity.Plan?.Duration ?? 0,
                PlanTier = entity.Plan?.Tier ?? 0,
                AccountId = entity.Account_id,
                AccountName = entity.Account?.Name,
                AccountUsername = entity.Account?.Username,
                AccountEmail = entity.Account?.Email,
                AccountPhone = entity.Account?.Phone,
                AccountCreatedAt = entity.Account?.CreatedAt,
                CreatedAt = entity.CreatedAt,
                PaidAt = entity.PaidAt,
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                PaymentDescription = entity.PaymentDescription,
                EvidenceLevel = PaymentEvidenceHelper.ComputeEvidenceLevel(entity),
                EvidenceSyncedAt = entity.EvidenceSyncedAt,
                EvidenceSource = entity.EvidenceSource,
                IsAdminGrant = isAdminGrant,
                GrantedByAccountId = entity.GrantedByAccountId,
                GrantedByName = entity.GrantedByAccount?.Name
                    ?? entity.GrantedByAccount?.Username
                    ?? entity.GrantedByAccount?.Email
            };
        }

        private SubscriptionResponseDto MapToDto(Subscription entity)
        {
            if (entity == null) return null;
            return new SubscriptionResponseDto
            {
                Sub_id = entity.Sub_id,
                Account_id = entity.Account_id,
                Plan_id = entity.Plan_id,
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                Status = entity.Status,
                PaymentRef = entity.PaymentRef,
                PricePaid = entity.PricePaid,
                IsDeleted = entity.IsDeleted,
                CreatedAt = entity.CreatedAt,
                PaidAt = entity.PaidAt,
                PaymentProvider = entity.PaymentProvider,
                ProviderStatus = entity.ProviderStatus
            };
        }
    }
}
