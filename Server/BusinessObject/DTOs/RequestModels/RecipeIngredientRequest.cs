using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class RecipeIngredientRequest
    {
        public Guid Recipe_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public int Quantity { get; set; }
        public string UOM { get; set; }
    }
}
