using BusinessObject.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.DTOs.RequestModels
{
    public class CreateFeedbackRequest
    {
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        [MaxLength(200, ErrorMessage = "Tiêu đề tối đa 200 ký tự")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nội dung phản hồi không được để trống")]
        public string Content { get; set; } = string.Empty;

        public FeedbackCategoryEnum Category { get; set; } = FeedbackCategoryEnum.Other;

        [Range(1, 5, ErrorMessage = "Đánh giá phải từ 1 đến 5 sao")]
        public int? Rating { get; set; }

        public string? AttachmentUrl { get; set; }

        [EmailAddress(ErrorMessage = "Email liên hệ không hợp lệ")]
        public string? ContactEmail { get; set; }
    }

    public class ReplyFeedbackRequest
    {
        [Required(ErrorMessage = "Nội dung phản hồi của quản trị viên không được để trống")]
        public string AdminReply { get; set; } = string.Empty;
    }

    public class FeedbackFilterRequest
    {
        public FeedbackStatusEnum? Status { get; set; }
        public FeedbackCategoryEnum? Category { get; set; }
        public string? Search { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
