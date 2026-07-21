using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class CalorieSuggestionResponseDto
    {
        public Guid Recipe_id { get; set; }
        public Guid Account_id { get; set; }
        public string Recipe_name { get; set; }
        public string Description { get; set; }
        public string Instruction { get; set; }
        public int CookTime { get; set; }
        public int PrepTime { get; set; }
        public int Servings { get; set; }
        public string Difficulty { get; set; }

        public double TotalCalories { get; set; }
        public double CaloriesPerServing { get; set; }
        public double TotalProtein { get; set; }
        public double TotalCarbs { get; set; }
        public double TotalFat { get; set; }
        public double? TotalFiber { get; set; }
        public double? TotalSugar { get; set; }
        public double? TotalSalt { get; set; }
        public double? TotalCholesterol { get; set; }

        public double TargetCalories { get; set; }
        public double CalorieDeviation { get; set; }
        public double CalorieMatchPercent { get; set; }
    }
}
