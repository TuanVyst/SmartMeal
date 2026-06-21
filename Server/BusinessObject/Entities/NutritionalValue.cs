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

        public double Calories { get; set; } = 0;
        public double Protein { get; set; } = 0;
        public double Carbohydrates { get; set; } = 0;
        public double Fat { get; set; } = 0;
        public double Fiber { get; set; } = 0;
        public double Sugar { get; set; } = 0;
        public double Sodium { get; set; } = 0;
        public double Cholesterol { get; set; } = 0;

        [NotMapped]
        public bool IsDeleted { get; set; } = false;

        // Navigation property (Quan hệ 1-1 với Ingredient)
        public Ingredient Ingredient { get; set; }
    }
}
