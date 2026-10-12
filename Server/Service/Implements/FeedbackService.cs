using BusinessObject.DTOs.RequestModels;
using BusinessObject.DTOs.ResponseModels;
using BusinessObject.Entities;
using BusinessObject.Enums;
using Microsoft.Extensions.Logging;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepo _feedbackRepo;
        private readonly IAccountRepo _accountRepo;
        private readonly IEmailService _emailService;
        private readonly ILogger<FeedbackService> _logger;

        public FeedbackService(
            IFeedbackRepo feedbackRepo,
            IAccountRepo accountRepo,
            IEmailService emailService,
            ILogger<FeedbackService> logger)
        {
            _feedbackRepo = feedbackRepo;
            _accountRepo = accountRepo;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<FeedbackResponseDto> CreateFeedbackAsync(Guid accountId, CreateFeedbackRequest request)
        {
            var account = await _accountRepo.GetAccountById(accountId);
            var contactEmail = !string.IsNullOrWhiteSpace(request.ContactEmail)
                ? request.ContactEmail.Trim()
                : account?.Email;

            var entity = new Feedback
            {
                Account_id = accountId,
                ContactEmail = contactEmail,
                Category = request.Category,
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                Rating = request.Rating,
                AttachmentUrl = request.AttachmentUrl,
                Status = FeedbackStatusEnum.Pending,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            var saved = await _feedbackRepo.CreateFeedbackAsync(entity);
            return MapToDto(saved, account?.Username, account?.Email);
        }

        public async Task<FeedbackListResponseDto> GetFeedbacksPagedAsync(FeedbackFilterRequest request)
        {
            var (items, totalCount) = await _feedbackRepo.GetFeedbacksPagedAsync(
                request.Status,
                request.Category,
                request.Search,
                request.PageIndex < 1 ? 1 : request.PageIndex,
                request.PageSize < 1 ? 10 : request.PageSize
            );

            return new FeedbackListResponseDto
            {
                Items = items.Select(f => MapToDto(f)).ToList(),
                TotalCount = totalCount,
                PageIndex = request.PageIndex,
                PageSize = request.PageSize
            };
        }

        public async Task<FeedbackResponseDto?> GetFeedbackByIdAsync(Guid feedbackId)
        {
            var feedback = await _feedbackRepo.GetFeedbackByIdAsync(feedbackId);
            return feedback == null ? null : MapToDto(feedback);
        }

        public async Task<List<FeedbackResponseDto>> GetMyFeedbacksAsync(Guid accountId)
        {
            var list = await _feedbackRepo.GetFeedbacksByAccountIdAsync(accountId);
            return list.Select(f => MapToDto(f)).ToList();
        }

        public async Task<FeedbackResponseDto> ReplyFeedbackAsync(Guid feedbackId, Guid adminAccountId, ReplyFeedbackRequest request)
        {
            var feedback = await _feedbackRepo.GetFeedbackByIdAsync(feedbackId);
            if (feedback == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy phản hồi với mã {feedbackId}");
            }

            var adminAccount = await _accountRepo.GetAccountById(adminAccountId);

            feedback.AdminReply = request.AdminReply.Trim();
            feedback.RepliedBy = adminAccountId;
            feedback.RepliedAt = DateTime.UtcNow;
            feedback.Status = FeedbackStatusEnum.Replied;

            var updated = await _feedbackRepo.UpdateFeedbackAsync(feedback);

            // Gửi email thông báo cho người dùng
            var recipientEmail = !string.IsNullOrWhiteSpace(feedback.ContactEmail)
                ? feedback.ContactEmail
                : feedback.Account?.Email;

            if (!string.IsNullOrWhiteSpace(recipientEmail))
            {
                try
                {
                    var subject = $"[SmartMeal] Phản hồi ý kiến đóng góp: {feedback.Title}";
                    var userName = feedback.Account?.Name ?? feedback.Account?.Username ?? "bạn";
                    var htmlBody = $@"
                        <div style=""font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;"">
                            <div style=""text-align: center; margin-bottom: 24px;"">
                                <h2 style=""color: #10b981; margin: 0; font-size: 24px;"">SmartMeal</h2>
                                <p style=""color: #64748b; margin: 4px 0 0 0; font-size: 14px;"">Hệ thống gợi ý & quản lý dinh dưỡng thông minh</p>
                            </div>
                            <p style=""font-size: 16px; color: #1e293b;"">Xin chào <strong>{userName}</strong>,</p>
                            <p style=""color: #475569; line-height: 1.6;"">
                                Cảm ơn bạn đã dành thời gian gửi phản hồi cho SmartMeal. Đội ngũ quản trị viên đã xem xét và gửi câu trả lời cho bạn như sau:
                            </p>
                            
                            <div style=""background-color: #f8fafc; border-left: 4px solid #94a3b8; padding: 14px 16px; margin: 20px 0; border-radius: 6px;"">
                                <p style=""margin: 0 0 6px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #64748b;"">Tiêu đề phản hồi:</p>
                                <p style=""margin: 0 0 10px 0; font-weight: 600; color: #1e293b;"">{feedback.Title}</p>
                                <p style=""margin: 0 0 6px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #64748b;"">Nội dung của bạn:</p>
                                <p style=""margin: 0; color: #334155; font-style: italic; white-space: pre-wrap;"">{feedback.Content}</p>
                            </div>

                            <div style=""background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; margin: 20px 0; border-radius: 6px;"">
                                <p style=""margin: 0 0 8px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #065f46;"">Câu trả lời từ Quản trị viên:</p>
                                <p style=""margin: 0; color: #047857; font-size: 15px; line-height: 1.6; white-space: pre-wrap;"">{request.AdminReply}</p>
                            </div>

                            <p style=""color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 24px;"">
                                Nếu bạn vẫn còn thắc mắc hoặc cần hỗ trợ thêm, bạn có thể tiếp tục sử dụng nút phản hồi ngay trên ứng dụng SmartMeal bất cứ lúc nào.
                            </p>
                            <hr style=""border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"" />
                            <p style=""color: #94a3b8; font-size: 12px; text-align: center; margin: 0;"">
                                Email này được gửi tự động từ hệ thống SmartMeal. Chúc bạn luôn có những bữa ăn lành mạnh và ngon miệng!
                            </p>
                        </div>";

                    await _emailService.SendEmailAsync(recipientEmail, subject, htmlBody);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi gửi email thông báo phản hồi cho {Email}", recipientEmail);
                }
            }

            return MapToDto(updated, updated.Account?.Username, updated.Account?.Email, adminAccount?.Name ?? adminAccount?.Username);
        }

        public async Task<bool> DeleteFeedbackAsync(Guid feedbackId)
        {
            return await _feedbackRepo.SoftDeleteFeedbackAsync(feedbackId);
        }

        private static FeedbackResponseDto MapToDto(
            Feedback f,
            string? fallbackUsername = null,
            string? fallbackEmail = null,
            string? fallbackAdminName = null)
        {
            return new FeedbackResponseDto
            {
                Feedback_id = f.Feedback_id,
                Account_id = f.Account_id,
                UserName = f.Account?.Name ?? f.Account?.Username ?? fallbackUsername,
                UserEmail = f.Account?.Email ?? fallbackEmail,
                ContactEmail = f.ContactEmail,
                Category = f.Category,
                CategoryName = GetCategoryName(f.Category),
                Title = f.Title,
                Content = f.Content,
                Rating = f.Rating,
                AttachmentUrl = f.AttachmentUrl,
                Status = f.Status,
                StatusName = GetStatusName(f.Status),
                AdminReply = f.AdminReply,
                RepliedBy = f.RepliedBy,
                RepliedByName = f.RepliedByAccount?.Name ?? f.RepliedByAccount?.Username ?? fallbackAdminName,
                RepliedAt = f.RepliedAt,
                CreatedAt = f.CreatedAt
            };
        }

        private static string GetCategoryName(FeedbackCategoryEnum category) => category switch
        {
            FeedbackCategoryEnum.Bug => "Báo lỗi",
            FeedbackCategoryEnum.Suggestion => "Góp ý tính năng",
            FeedbackCategoryEnum.Nutrition => "Dinh dưỡng & Thực đơn",
            FeedbackCategoryEnum.Billing => "Gói dịch vụ & Thanh toán",
            _ => "Khác"
        };

        private static string GetStatusName(FeedbackStatusEnum status) => status switch
        {
            FeedbackStatusEnum.Pending => "Chờ phản hồi",
            FeedbackStatusEnum.Replied => "Đã phản hồi",
            FeedbackStatusEnum.Closed => "Đã đóng",
            _ => "Không xác định"
        };
    }
}
