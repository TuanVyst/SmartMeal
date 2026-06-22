using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("NutritionLog")]
    public class NutritionLog
    {
        [Key]
        public Guid Log_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        public DateTime LogDate { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string? MealType { get; set; }

        [ForeignKey("Recipe")]
        public Guid? Recipe_id { get; set; }

        [ForeignKey("Ingredient")]
        public Guid? Ingredient_id { get; set; }

        public double? Quantity { get; set; }

        [MaxLength(50)]
        public string? Unit { get; set; }

        public double? TotalCalories { get; set; }
        public double? TotalProtein { get; set; }
        public double? TotalCarbs { get; set; }
        public double? TotalFat { get; set; }
        public double? TotalFiber { get; set; }
        public double? TotalSugar { get; set; }
        public double? TotalSalt { get; set; }
        public double? TotalCholesterol { get; set; }

        public bool IsDeleted { get; set; } = false;

        public virtual Account Account { get; set; }
        public virtual Recipe? Recipe { get; set; }
        public virtual Ingredient? Ingredient { get; set; }
    }
}
