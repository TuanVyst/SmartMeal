using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("BmiLog")]
    public class BmiLog
    {
        [Key]
        public Guid Log_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        public double? Height { get; set; }

        public double? Weight { get; set; }

        public double? Bmi { get; set; }

        [MaxLength(20)]
        public string? BmiLevel { get; set; }

        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;

        public virtual Account Account { get; set; }
    }
}
