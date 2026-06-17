using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("NutritionGoal")]
    public class NutritionGoal
    {
        [Key]
        public Guid Goal_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        public double? TargetCalories { get; set; }
        public double? TargetProtein { get; set; }
        public double? TargetCarbs { get; set; }
        public double? TargetFat { get; set; }
        public double? TargetFiber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;

        public virtual Account Account { get; set; }
    }
}
