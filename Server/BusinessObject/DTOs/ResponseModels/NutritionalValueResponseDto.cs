using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class NutritionalValueResponseDto
    {
        public Guid Nv_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public double Calories { get; set; }
        public double Protein { get; set; }
        public double Carbohydrates { get; set; }
        public double Fat { get; set; }
        public double Fiber { get; set; }
        public double Sugar { get; set; }
        public double Sodium { get; set; }
        public double Cholesterol { get; set; }
        public bool IsDeleted { get; set; }
    }
}
