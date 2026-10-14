using BusinessObject.Entities;
using BusinessObject.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IFeedbackRepo
    {
        Task<Feedback> CreateFeedbackAsync(Feedback feedback);
        Task<Feedback?> GetFeedbackByIdAsync(Guid feedbackId);
        Task<List<Feedback>> GetFeedbacksByAccountIdAsync(Guid accountId);
        Task<(List<Feedback> Items, int TotalCount)> GetFeedbacksPagedAsync(
            FeedbackStatusEnum? status,
            FeedbackCategoryEnum? category,
            string? search,
            int pageIndex,
            int pageSize);
        Task<Feedback> UpdateFeedbackAsync(Feedback feedback);
        Task<bool> SoftDeleteFeedbackAsync(Guid feedbackId);
    }
}
