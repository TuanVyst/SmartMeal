using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeIngredientResponseDto
    {
        public Guid RI_id { get; set; }
        public Guid Recipe_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public int Quantity { get; set; }
        public string UOM { get; set; }
        public bool IsDeleted { get; set; }

        public string Name { get; set; } = "";
        public NutritionalValueSimpleDto? NutritionalValue { get; set; }
    }
}
