using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Plan")]
    public class Plan
    {
        [Key]
        public Guid Plan_id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public double Price { get; set; }

        /// <summary>
        /// Duration in days. 0 = unlimited (Free tier)
        /// </summary>
        public int Duration { get; set; }

        /// <summary>
        /// Tier level: 0 = Free, 1 = Weekly, 2 = Monthly, 3 = Yearly
        /// </summary>
        public int Tier { get; set; } = 1;

        [MaxLength(500)]
        public string Description { get; set; }

        /// <summary>
        /// JSON array of feature keys enabled for this plan
        /// e.g. ["ai_basic","meal_plan","calorie_tracking"]
        /// </summary>
        public string Features { get; set; }

                public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual ICollection<Subscription> Subscriptions { get; set; }
    }
}
