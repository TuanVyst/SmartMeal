using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface ISubscriptionRepo
    {
        Task<List<Subscription>> GetAllSubscriptions();
        Task<List<Subscription>> GetSubscriptionsByAccountId(Guid accountId);
        Task<Subscription?> GetSubscriptionById(Guid id);
        Task<Subscription> CreateSubscription(Subscription subscription);
        Task<Subscription> UpdateSubscription(Subscription subscription);
        Task<Subscription> SoftDeleteSubscription(Guid id);

        // ---- Admin transaction dashboard / PayOS evidence sync ----

        /// <summary>
        /// Paged transactions with Account, Plan and GrantedByAccount loaded (read-only).
        /// </summary>
        Task<(List<Subscription> Items, int Total)> GetPagedSubscriptionsWithDetailsAsync(AdminTransactionFilter filter);

        /// <summary>
        /// Full filtered list for CSV export (read-only, capped at 50000 rows).
        /// </summary>
        Task<List<Subscription>> GetAllSubscriptionsWithDetailsAsync(AdminTransactionFilter filter);

        /// <summary>
        /// Single transaction with Account, Plan and GrantedByAccount loaded (read-only).
        /// </summary>
        Task<Subscription?> GetSubscriptionWithDetailsAsync(Guid id);

        /// <summary>
        /// Tracked lookup by PaymentRef (PayOS order code), used by the webhook.
        /// </summary>
        Task<Subscription?> GetByPaymentRefAsync(string paymentRef);

        /// <summary>
        /// Candidate transactions for PayOS evidence backfill (tracked, Plan included).
        /// </summary>
        Task<List<Subscription>> GetSubscriptionsForPayOsSyncAsync(
            DateTime fromUtc,
            DateTime toUtcExclusive,
            List<string>? statuses,
            List<Guid>? subIds,
            int limit,
            int offset,
            bool skipFullEvidence);

        /// <summary>
        /// Aggregate counters for the same filter (SQL aggregates).
        /// </summary>
        Task<AdminTransactionSummaryDto> GetTransactionSummaryAsync(AdminTransactionFilter filter);
    }
}
