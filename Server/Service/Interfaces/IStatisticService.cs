using System;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IStatisticService
    {
        Task<object> GetSubscriptionStatisticsAsync(DateTime? startDate, DateTime? endDate);
        Task<object> GetWeeklyEngagementStatisticsAsync(DateTime? targetDate = null);
    }
}
