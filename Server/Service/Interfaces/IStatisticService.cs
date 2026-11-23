using BusinessObject.Dtos.ResponseModels;
using System;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IStatisticService
    {
        Task<object> GetSubscriptionStatisticsAsync(DateTime? startDate, DateTime? endDate);
        Task<object> GetWeeklyEngagementStatisticsAsync(DateTime? targetDate = null);

        /// <summary>
        /// Revenue / transaction overview for the subscription dashboard (VN calendar dates).
        /// </summary>
        Task<SubscriptionOverviewDto> GetSubscriptionOverviewAsync(DateTime? fromDate, DateTime? toDate);
    }
}
