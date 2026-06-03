using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ISubscriptionService
    {
        Task<List<SubscriptionResponseDto>> GetAllSubscriptions();
        Task<SubscriptionResponseDto?> GetSubscriptionById(Guid id);
        Task<SubscriptionResponseDto> CreateSubscription(SubscriptionRequest subscription);
        Task<SubscriptionResponseDto> UpdateSubscription(Guid id, SubscriptionRequest subscription);
        Task<SubscriptionResponseDto> SoftDeleteSubscription(Guid id);
    }
}
