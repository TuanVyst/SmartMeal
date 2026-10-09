using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("UserSessionLog")]
    public class UserSessionLog
    {
        [Key]
        public Guid Session_id { get; set; } = Guid.NewGuid();

        public Guid? Account_id { get; set; }

        [Required]
        [MaxLength(128)]
        public string SessionToken { get; set; } = string.Empty;

        public DateTime StartTime { get; set; } = DateTime.UtcNow;

        public DateTime LastHeartbeat { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Total active duration of this session in seconds
        /// </summary>
        public int DurationSeconds { get; set; } = 0;

        [MaxLength(100)]
        public string? IpAddress { get; set; }

        [MaxLength(255)]
        public string? UserAgent { get; set; }

        /// <summary>
        /// Timestamp when the user first selected/viewed a recipe in this session
        /// </summary>
        public DateTime? FirstRecipeSelectTime { get; set; }

        /// <summary>
        /// Elapsed seconds from StartTime until the user selected their first recipe in this session
        /// </summary>
        public int? TimeToFirstRecipeSelectSeconds { get; set; }

        /// <summary>
        /// ID of the first recipe selected in this session
        /// </summary>
        public Guid? FirstRecipe_id { get; set; }

        // Navigation properties
        [ForeignKey("Account_id")]
        public virtual Account? Account { get; set; }

        [ForeignKey("FirstRecipe_id")]
        public virtual Recipe? FirstRecipe { get; set; }
    }
}
