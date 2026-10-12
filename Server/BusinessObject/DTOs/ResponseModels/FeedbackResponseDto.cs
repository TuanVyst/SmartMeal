using BusinessObject.Enums;
using System;
using System.Collections.Generic;

namespace BusinessObject.DTOs.ResponseModels
{
    public class FeedbackResponseDto
    {
        public Guid Feedback_id { get; set; }
        public Guid Account_id { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public string? ContactEmail { get; set; }
        public FeedbackCategoryEnum Category { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int? Rating { get; set; }
        public string? AttachmentUrl { get; set; }
        public FeedbackStatusEnum Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string? AdminReply { get; set; }
        public Guid? RepliedBy { get; set; }
        public string? RepliedByName { get; set; }
        public DateTime? RepliedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class FeedbackListResponseDto
    {
        public List<FeedbackResponseDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    }
}
