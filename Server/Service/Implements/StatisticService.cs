using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Service.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class StatisticService : IStatisticService
    {
        private readonly AppDbContext _ctx;

        public StatisticService(AppDbContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<object> GetSubscriptionStatisticsAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = _ctx.Subscriptions
                .Include(s => s.Plan)
                .Where(s => !s.IsDeleted && s.Status == "PAID" || s.Status == "active");

            if (startDate.HasValue)
                query = query.Where(s => s.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(s => s.StartDate <= endDate.Value);

            var subscriptions = await query.ToListAsync();

            var totalSubscribers = subscriptions.Count;
            var totalRevenue = subscriptions.Sum(s => s.PricePaid);

            var planStats = subscriptions
                .GroupBy(s => new { s.Plan_id, s.Plan.Name })
                .Select(g => new
                {
                    PlanId = g.Key.Plan_id,
                    PlanName = g.Key.Name,
                    SubscriberCount = g.Count(),
                    Revenue = g.Sum(s => s.PricePaid)
                })
                .ToList();

            return new
            {
                TotalSubscribers = totalSubscribers,
                TotalRevenue = totalRevenue,
                PlanStatistics = planStats
            };
        }
    }
}
