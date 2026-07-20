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
    }
}
