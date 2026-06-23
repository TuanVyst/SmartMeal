using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("DietPlan")]
    public class DietPlan
    {
        [Key]
        public Guid Diet_id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public double? TargetCalories { get; set; }
        public double? MaxCarbs { get; set; }
        public double? MaxFat { get; set; }
        public double? MinProtein { get; set; }

                public bool IsDeleted { get; set; } = false;
    }
}
