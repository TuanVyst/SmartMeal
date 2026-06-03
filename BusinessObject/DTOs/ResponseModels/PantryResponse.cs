using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class PantryResponse
    {
        public Guid Pantry_id { get; set; }
        public Guid Account_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public string IngredientName { get; set; }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
