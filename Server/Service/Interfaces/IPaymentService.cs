using BusinessObject.Dtos.ResponseModels;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> CreatePaymentLinkAsync(System.Guid accountId, System.Guid planId);
        Task HandleWebhookAsync(object webhookData);
        Task<bool> CheckPaymentStatusAsync(long orderCode);
    }
}
