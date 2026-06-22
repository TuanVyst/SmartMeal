using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("HealthProfile")]
    public class HealthProfile
    {
        [Key]
        public Guid Profile_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(20)]
        public string? Gender { get; set; }

        public double? Height { get; set; } // cm
        public double? Weight { get; set; } // kg

        [MaxLength(50)]
        public string? ActivityLevel { get; set; }

        [MaxLength(50)]
        public string? Goal { get; set; }

        public DateTime? UpdatedAt { get; set; }

        [NotMapped]

        public bool IsDeleted { get; set; } = false;

        // Navigation
        public virtual Account Account { get; set; }
    }
}
