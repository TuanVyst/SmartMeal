using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class NutritionGoalRequest
    {
        public Guid Account_id { get; set; }
        public double? TargetCalories { get; set; }
        public double? TargetProtein { get; set; }
        public double? TargetCarbs { get; set; }
        public double? TargetFat { get; set; }
        public double? TargetFiber { get; set; }
    }
}
