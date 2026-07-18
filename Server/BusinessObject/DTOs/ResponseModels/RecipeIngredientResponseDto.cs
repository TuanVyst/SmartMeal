using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeIngredientResponseDto
    {
        public Guid Id { get; set; }           // serializes as "id" (was RI_id → rI_id)
        public Guid Recipe_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public int Quantity { get; set; }
        public string Uom { get; set; }          // serializes as "uom" (was UOM → uOM)
        public bool IsDeleted { get; set; }
        public bool IsPrimary { get; set; }

        public string Name { get; set; } = "";
        public NutritionalValueSimpleDto? NutritionalValue { get; set; }
    }
}
