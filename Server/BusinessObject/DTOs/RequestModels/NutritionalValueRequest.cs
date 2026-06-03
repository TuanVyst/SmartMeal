using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class NutritionalValueRequest
    {
        public Guid Ingredient_id { get; set; }
        public double Calories { get; set; }
    }
}
