using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class IngredientResponseDto
    {
        public Guid Ingredient_id { get; set; }
        public string Name { get; set; }
        public double AveragePrice { get; set; }
        public string ImageUrl { get; set; }
        public bool IsDeleted { get; set; }
        
        public NutritionalValueSimpleDto Nutritional_value { get; set; }
        public ICollection<IngredientLabelSimpleDto> IngredientLabels { get; set; }
    }

    public class NutritionalValueSimpleDto
    {
        public Guid Id { get; set; }
        public double Calories { get; set; }
        public double? Protein { get; set; }
        public double? Carbohydrates { get; set; }
        public double? Carbs { get; set; }
        public double? Fat { get; set; }
        public double? Fiber { get; set; }
        public double? Sugar { get; set; }
        public double? Sodium { get; set; }
        public double? Cholesterol { get; set; }
        public double? ServingSize { get; set; }
        public string? ServingUnit { get; set; }
    }

    public class IngredientLabelSimpleDto
    {
        public Guid Label_id { get; set; }
        public string LabelName { get; set; }
    }
}

