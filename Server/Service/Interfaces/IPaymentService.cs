using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> CreatePaymentLinkAsync(System.Guid accountId, System.Guid planId);
        Task HandleWebhookAsync(object webhookData);
        Task<bool> CheckPaymentStatusAsync(long orderCode);
        Task<bool> CancelPaymentAsync(long orderCode);

        /// <summary>
        /// Live PayOS lookup for a single order code (admin reconciliation view).
        /// </summary>
        Task<PayOsVerificationDto> VerifyPaymentLinkAsync(long orderCode);

        /// <summary>
        /// Batched, idempotent, dry-runnable backfill of PayOS evidence.
        /// </summary>
        Task<PayOsSyncResultDto> SyncPayOsEvidenceAsync(PayOsSyncRequest request);
    }
}
