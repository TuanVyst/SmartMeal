using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class NutritionalValue
    {
        [Key]
        public Guid Nv_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Ingredient")]
        public Guid Ingredient_id { get; set; }

        public double Calories { get; set; }
        public double? Protein { get; set; }
        public double? Carbs { get; set; }
        public double? Fat { get; set; }
        public double? Fiber { get; set; }
        public double? Sugar { get; set; }
        public double? Salt { get; set; }
        public double? Cholesterol { get; set; }
        public double? ServingSize { get; set; }
        public string? ServingUnit { get; set; }
        public string? EverydayUnit { get; set; }
        public double? EverydayWeight { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation property (Quan hệ 1-1 với Ingredient)
        public Ingredient Ingredient { get; set; }
    }
}
