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
        public Guid Ingredient_id { get; set; } = Guid.NewGuid();

        public string Name { get; set; }
        public double AveragePrice { get; set; }
        public string ImageUrl { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public NutritionalValue Nutritional_value { get; set; }
        public ICollection<AffiliateProduct> AffiliateProducts { get; set; }
        public ICollection<RecipeIngredient> Recipe_Ingredients { get; set; }
        public ICollection<IngredientLabel> IngredientLabels { get; set; }
        public ICollection<GroceryItem> GroceryItems { get; set; }
         public ICollection<Pantry> Pantries { get; set; }
        public ICollection<Allergy> Allergy { get; set; }
    }
}
