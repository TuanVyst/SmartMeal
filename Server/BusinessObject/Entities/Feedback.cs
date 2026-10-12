using BusinessObject.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("Feedback")]
    public class Feedback
    {
        [Key]
        public Guid Feedback_id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid Account_id { get; set; }

        [MaxLength(150)]
        public string? ContactEmail { get; set; }

        public FeedbackCategoryEnum Category { get; set; } = FeedbackCategoryEnum.Other;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Range(1, 5)]
        public int? Rating { get; set; }

        [MaxLength(1000)]
        public string? AttachmentUrl { get; set; }

        public FeedbackStatusEnum Status { get; set; } = FeedbackStatusEnum.Pending;

        public string? AdminReply { get; set; }

        public Guid? RepliedBy { get; set; }

        public DateTime? RepliedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        [ForeignKey("Account_id")]
        public virtual Account? Account { get; set; }

        [ForeignKey("RepliedBy")]
        public virtual Account? RepliedByAccount { get; set; }
    }
}
