using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class Ingredient
    {
        [Key]
        public int Ingredient_id { get; set; }

        [ForeignKey("Nutritional_value")]
        public int? Nv_id { get; set; } // Khóa ngoại liên kết tới Nutritional_value

        public string Name { get; set; }
        public double AveragePrice { get; set; }
        public string ImageUrl { get; set; }

        // Navigation properties
        public Nutritional_value Nutritional_value { get; set; }
        public ICollection<AffiliateProduct> AffiliateProducts { get; set; }
        public ICollection<Recipe_Ingredient> Recipe_Ingredients { get; set; }
        public ICollection<IngredientLabel> IngredientLabels { get; set; }
    }
}
