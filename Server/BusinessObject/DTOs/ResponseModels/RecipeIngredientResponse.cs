using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeIngredientResponse
    {
        public Guid Id { get; set; }           // serializes as "id"
        public Guid Recipe_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public int Quantity { get; set; }
        public string Uom { get; set; }          // serializes as "uom"
        public bool IsPrimary { get; set; }
    }
}
