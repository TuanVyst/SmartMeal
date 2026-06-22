using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("ConditionDietRecommendation")]
    public class ConditionDietRecommendation
    {
        [Key]
        public Guid Rec_id { get; set; } = Guid.NewGuid();

        [ForeignKey("MedicalCondition")]
        public Guid Condition_id { get; set; }

        [ForeignKey("DietPlan")]
        public Guid Diet_id { get; set; }

        public int Priority { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public bool IsDeleted { get; set; } = false;

        public virtual MedicalCondition MedicalCondition { get; set; }
        public virtual DietPlan DietPlan { get; set; }
    }
}
