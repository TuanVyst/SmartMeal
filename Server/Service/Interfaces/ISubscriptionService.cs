using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ISubscriptionService
    {
        Task<List<SubscriptionResponseDto>> GetAllSubscriptions();
        Task<List<SubscriptionResponseDto>> GetSubscriptionsByAccountId(Guid accountId);
        Task<SubscriptionResponseDto?> GetSubscriptionById(Guid id);
        Task<SubscriptionResponseDto> CreateSubscription(SubscriptionRequest subscription);
        Task<SubscriptionResponseDto> UpdateSubscription(Guid id, SubscriptionRequest subscription);
        Task<SubscriptionResponseDto> SoftDeleteSubscription(Guid id);
        Task<bool> HasFeatureAsync(Guid accountId, string featureKey);
        Task<SubscriptionResponseDto> GrantSubscriptionByAdminAsync(AdminGrantSubscriptionRequest request);
        Task<bool> RevokeActiveSubscriptionByAdminAsync(Guid accountId);

        // ---- Admin transaction dashboard ----

        Task<AdminTransactionListResponse> GetAdminTransactionsAsync(AdminTransactionFilter filter, CancellationToken ct = default);

        Task<AdminTransactionDetailDto?> GetAdminTransactionDetailAsync(Guid id);

        /// <summary>Builds the UTF-8 CSV body (no BOM — the controller prepends it).</summary>
        Task<string> BuildAdminTransactionsCsvAsync(AdminTransactionFilter filter);
    }
}
