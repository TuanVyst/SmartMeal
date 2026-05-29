using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class GroceryListResponse
    {
        public Guid List_id { get; set; }
        public Guid Account_id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public List<GroceryItemResponse> Items { get; set; }
    }

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
