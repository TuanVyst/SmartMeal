using BusinessObject.Entities;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IFeedbackService
    {
        Task<List<Feedback>> GetAllFeedbacks();
        Task<Feedback?> GetFeedbackById(Guid id);
        Task<Feedback> CreateFeedback(FeedbackRequest request);
        Task<Feedback> UpdateFeedback(Guid id, FeedbackRequest request);
        Task<Feedback> SoftDeleteFeedback(Guid id);
    }
}
