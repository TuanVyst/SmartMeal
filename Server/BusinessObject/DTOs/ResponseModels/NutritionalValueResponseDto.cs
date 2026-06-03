using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class NutritionalValueResponseDto
    {
        public Guid Nv_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public double Calories { get; set; }
        public bool IsDeleted { get; set; }
    }
}
