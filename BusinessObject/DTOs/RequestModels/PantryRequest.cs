using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class PantryRequest
    {
        public Guid Account_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
