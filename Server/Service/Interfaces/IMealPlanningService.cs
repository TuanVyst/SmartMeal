using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IMealPlanningService
    {
        Task<MealPlanResponseDto> GeneratePlanPreviewAsync(Guid accountId, int days = 7);
        Task<MealPlanResponseDto> ConfirmPlanAsync(Guid planId);
        Task<MealPlanResponseDto> GetActivePlanAsync(Guid accountId);
        Task<List<MealPlanResponseDto>> GetAllPlansAsync(Guid accountId);
        
        // Swap capability for preview
        Task<MealPlanResponseDto> SwapRecipeAsync(Guid planId, Guid entryId, Guid newRecipeId);

        Task<MealPlanResponseDto> SuggestNextDayAsync(Guid accountId);
        Task<MealPlanResponseDto> SuggestForDateAsync(Guid accountId, DateTime targetDate, List<string> meals = null);
        Task<Dictionary<string, bool>> CheckDateMealsAsync(Guid accountId, DateTime date);
    }
}
