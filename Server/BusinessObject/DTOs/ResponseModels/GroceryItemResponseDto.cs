using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class GroceryItemResponseDto
    {
        public Guid Item_id { get; set; }
        public Guid List_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public Guid? Product_id { get; set; }
        public double Quantity { get; set; }
        public string Unit { get; set; }
        public bool IsPurchased { get; set; }
        public string Field { get; set; }
        public bool IsDeleted { get; set; }
    }
}
