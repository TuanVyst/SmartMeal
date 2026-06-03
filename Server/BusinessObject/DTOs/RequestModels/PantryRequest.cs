using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class PantryRequest
    {
        public Guid Ingredient_id { get; set; }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public DateTime ExpiryDate { get; set; }
    }

    public class PantryUpdateRequest
    {
        public Guid? Ingredient_id { get; set; }
        public double? Quantity { get; set; }
        public string? Unit { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }
}
