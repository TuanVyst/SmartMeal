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

        // Navigation property (Quan hệ 1-1 với Ingredient)
        public Ingredient Ingredient { get; set; }
    }
}
