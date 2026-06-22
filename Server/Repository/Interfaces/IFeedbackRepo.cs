using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IFeedbackRepo
    {
        Task<List<Feedback>> GetAllFeedbacks();
        Task<Feedback?> GetFeedbackById(Guid id);
        Task<Feedback> CreateFeedback(Feedback feedback);
        Task<Feedback> UpdateFeedback(Feedback feedback);
        Task<Feedback> SoftDeleteFeedback(Guid id);
    }
}
