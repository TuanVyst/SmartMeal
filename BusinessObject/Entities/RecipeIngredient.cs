using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class RecipeIngredient
    {
        [Key]
        public int RI_id { get; set; }

        public int Recipe_id { get; set; } // Khóa ngoại trỏ tới bảng Recipe 

        [ForeignKey("Ingredient")]
        public int Ingredient_id { get; set; }

        public int Quantity { get; set; }
        public string UOM { get; set; } // Đơn vị đo lường (Unit Of Measure)

        // Navigation properties
        public Ingredient Ingredient { get; set; }
    }
}
