using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class PantryResponseDto
    {
        public Guid Pantry_id { get; set; }
        public Guid Account_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
