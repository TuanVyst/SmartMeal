using BusinessObject.DTOs.RequestModels;
using BusinessObject.DTOs.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IFeedbackService
    {
        Task<FeedbackResponseDto> CreateFeedbackAsync(Guid accountId, CreateFeedbackRequest request);
        Task<FeedbackListResponseDto> GetFeedbacksPagedAsync(FeedbackFilterRequest request);
        Task<FeedbackResponseDto?> GetFeedbackByIdAsync(Guid feedbackId);
        Task<List<FeedbackResponseDto>> GetMyFeedbacksAsync(Guid accountId);
        Task<FeedbackResponseDto> ReplyFeedbackAsync(Guid feedbackId, Guid adminAccountId, ReplyFeedbackRequest request);
        Task<bool> DeleteFeedbackAsync(Guid feedbackId);
    }
}
