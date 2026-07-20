using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("MealPlanEntry")]
    public class MealPlanEntry
    {
        [Key]
        public Guid Entry_id { get; set; } = Guid.NewGuid();

        [ForeignKey("MealPlanDay")]
        public Guid Day_id { get; set; }

        [ForeignKey("Recipe")]
        public Guid Recipe_id { get; set; }

        /// <summary>breakfast | lunch | dinner | snack</summary>
        [MaxLength(20)]
        public string MealSlot { get; set; }

        public double SlotCalories { get; set; }
        public double SlotProtein  { get; set; }
        public double SlotCarbs    { get; set; }
        public double SlotFat      { get; set; }
        public double SlotFiber    { get; set; }

        public int SortOrder { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation
        public virtual MealPlanDay MealPlanDay { get; set; }
        public virtual Recipe Recipe { get; set; }
    }
}
