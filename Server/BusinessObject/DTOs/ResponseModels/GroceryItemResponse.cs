using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class GroceryItemResponse
    {
        public Guid Item_id { get; set; }
        public Guid List_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public string IngredientName { get; set; }
        public Guid? Product_id { get; set; }
        public string ProductName { get; set; }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public bool IsPurchased { get; set; }
        public string Field { get; set; }
    }
}
