using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.RequestModels
{
    public class IngredientRequest
    {
        public string Name { get; set; }
        public double AveragePrice { get; set; }
        public string ImageUrl { get; set; }
        public List<Guid>? IngredientTagIds { get; set; }
        public NutritionalValueData? NutritionalValue { get; set; }
    }

    public class NutritionalValueData
    {
        public double Calories { get; set; } = 0;
        public double Protein { get; set; } = 0;
        public double Carbohydrates { get; set; } = 0;
        public double Fat { get; set; } = 0;
        public double Fiber { get; set; } = 0;
        public double Sugar { get; set; } = 0;
        public double Sodium { get; set; } = 0;
        public double Cholesterol { get; set; } = 0;
    }
}

