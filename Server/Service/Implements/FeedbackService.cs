using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepo _feedbackRepo;

        public FeedbackService(IFeedbackRepo feedbackRepo)
        {
            _feedbackRepo = feedbackRepo;
        }

        public async Task<List<Feedback>> GetAllFeedbacks()
        {
            return await _feedbackRepo.GetAllFeedbacks();
        }

        public async Task<Feedback?> GetFeedbackById(Guid id)
        {
            return await _feedbackRepo.GetFeedbackById(id);
        }

        public async Task<Feedback> CreateFeedback(FeedbackRequest request)
        {
            var feedback = new Feedback
            {
                Feedback_id = Guid.NewGuid(),
                Account_id = request.Account_id ?? Guid.Empty,
                Title = request.Title,
                Content = request.Content,
                Rating = request.Rating,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
            };

            return await _feedbackRepo.CreateFeedback(feedback);
        }

        public async Task<Feedback> UpdateFeedback(Guid id, FeedbackRequest request)
        {
            var feedback = await _feedbackRepo.GetFeedbackById(id);
            if (feedback == null)
                throw new Exception("Feedback not found");

            feedback.Title = request.Title ?? feedback.Title;
            feedback.Content = request.Content ?? feedback.Content;
            feedback.Rating = request.Rating ?? feedback.Rating;

            return await _feedbackRepo.UpdateFeedback(feedback);
        }

        public async Task<Feedback> SoftDeleteFeedback(Guid id)
        {
            return await _feedbackRepo.SoftDeleteFeedback(id);
        }
    }
}
