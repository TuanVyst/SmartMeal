using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("MealPlanDay")]
    public class MealPlanDay
    {
        [Key]
        public Guid Day_id { get; set; } = Guid.NewGuid();

        [ForeignKey("MealPlan")]
        public Guid MealPlan_id { get; set; }

        public int DayIndex { get; set; }   // 1-based
        public DateTime DayDate { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation
        public virtual MealPlan MealPlan { get; set; }
        public virtual ICollection<MealPlanEntry> Entries { get; set; }
    }
}
