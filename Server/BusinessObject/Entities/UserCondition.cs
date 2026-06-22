using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("UserCondition")]
    public class UserCondition
    {
        [Key]
        public Guid UC_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        [ForeignKey("MedicalCondition")]
        public Guid Condition_id { get; set; }

        public DateTime? DiagnosedAt { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public bool IsDeleted { get; set; } = false;

        public virtual Account Account { get; set; }
        public virtual MedicalCondition MedicalCondition { get; set; }
    }
}
