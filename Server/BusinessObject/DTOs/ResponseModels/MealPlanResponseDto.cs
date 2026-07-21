using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class MealPlanEntryResponseDto
    {
        public Guid Entry_id { get; set; }
        public Guid Recipe_id { get; set; }
        public string RecipeName { get; set; }
        public string RecipeImage { get; set; }
        public string MealSlot { get; set; }
        public double SlotCalories { get; set; }
        public double SlotProtein { get; set; }
        public double SlotCarbs { get; set; }
        public double SlotFat { get; set; }
        public double SlotFiber { get; set; }
        public int SortOrder { get; set; }
        public int CookTime { get; set; }
        public string Difficulty { get; set; }
    }

    public class MealPlanDayResponseDto
    {
        public Guid Day_id { get; set; }
        public int DayIndex { get; set; }
        public DateTime DayDate { get; set; }
        public List<MealPlanEntryResponseDto> Entries { get; set; }
        
        public double TotalCalories { get; set; }
        public double TotalProtein { get; set; }
        public double TotalCarbs { get; set; }
        public double TotalFat { get; set; }
        public double TotalFiber { get; set; }
    }

    public class RequiredIngredientDto
    {
        public Guid Ingredient_id { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public string Category { get; set; }
        public double Quantity { get; set; }
        public string Uom { get; set; }
        public bool IsPossessed { get; set; } // Available in Pantry
    }

    public class MealPlanResponseDto
    {
        public Guid MealPlan_id { get; set; }
        public string Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int TotalDays { get; set; }
        public DateTime GeneratedAt { get; set; }
        
        public List<MealPlanDayResponseDto> Days { get; set; }
        public List<RequiredIngredientDto> RequiredIngredients { get; set; }
    }
}
