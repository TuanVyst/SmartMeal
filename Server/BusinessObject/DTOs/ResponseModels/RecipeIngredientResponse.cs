using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeIngredientResponse
    {
        public Guid RI_id { get; set; }
        public Guid Recipe_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public int Quantity { get; set; }
        public string UOM { get; set; }
    }
}
