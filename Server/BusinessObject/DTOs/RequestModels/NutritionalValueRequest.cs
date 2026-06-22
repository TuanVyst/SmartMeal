using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class NutritionalValueRequest
    {
        public Guid Ingredient_id { get; set; }
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
