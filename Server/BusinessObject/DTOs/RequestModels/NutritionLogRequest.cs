using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class NutritionLogRequest
    {
        public Guid Account_id { get; set; }
        public DateTime LogDate { get; set; } = DateTime.UtcNow;
        public string? MealType { get; set; }
        public Guid? Recipe_id { get; set; }
        public Guid? Ingredient_id { get; set; }
        public double? Quantity { get; set; }
        public string? Unit { get; set; }
        public double? TotalCalories { get; set; }
        public double? TotalProtein { get; set; }
        public double? TotalCarbs { get; set; }
        public double? TotalFat { get; set; }
        public double? TotalFiber { get; set; }
        public double? TotalSugar { get; set; }
        public double? TotalSodium { get; set; }
        public double? TotalCholesterol { get; set; }
    }
}
