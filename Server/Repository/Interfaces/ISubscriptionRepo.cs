using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface ISubscriptionRepo
    {
        Task<List<Subscription>> GetAllSubscriptions();
        Task<Subscription?> GetSubscriptionById(Guid id);
        Task<Subscription> CreateSubscription(Subscription subscription);
        Task<Subscription> UpdateSubscription(Subscription subscription);
        Task<Subscription> SoftDeleteSubscription(Guid id);
    }
}
