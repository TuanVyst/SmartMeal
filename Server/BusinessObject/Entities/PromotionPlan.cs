using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    /// <summary>Join row: which plans a promotion applies to.</summary>
    [Table("Promotion_plan")]
    public class PromotionPlan
    {
        public Guid Promo_id { get; set; }

        public Guid Plan_id { get; set; }

        [ForeignKey(nameof(Promo_id))]
        public virtual Promotion Promotion { get; set; }

        [ForeignKey(nameof(Plan_id))]
        public virtual Plan Plan { get; set; }
    }
}
