using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    /// <summary>
    /// Time-boxed percentage discount applied to one or more paid plans.
    /// At most one promotion may be active for a given plan at any moment
    /// (enforced by PromotionService when creating/updating).
    /// </summary>
    [Table("Promotion")]
    public class Promotion
    {
        [Key]
        public Guid Promo_id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        /// <summary>Discount percentage in the range 1..99.</summary>
        [Column(TypeName = "decimal(5,2)")]
        public double DiscountPercent { get; set; }

        /// <summary>Promotion window start (UTC).</summary>
        public DateTime StartAt { get; set; }

        /// <summary>Promotion window end (UTC).</summary>
        public DateTime EndAt { get; set; }

        /// <summary>Admin toggle; a disabled promotion never applies.</summary>
        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? CreatedByAccountId { get; set; }

        public virtual ICollection<PromotionPlan> PromotionPlans { get; set; } = new List<PromotionPlan>();
    }
}
