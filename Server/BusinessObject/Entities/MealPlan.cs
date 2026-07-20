using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("MealPlan")]
    public class MealPlan
    {
        [Key]
        public Guid MealPlan_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        /// <summary>preview | active | completed</summary>
        [MaxLength(20)]
        public string Status { get; set; } = "preview";

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int TotalDays { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;

        // Navigation
        public virtual Account Account { get; set; }
        public virtual ICollection<MealPlanDay> Days { get; set; }
    }
}
