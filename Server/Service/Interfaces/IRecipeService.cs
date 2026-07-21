using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRecipeService
    {
        Task<List<RecipeResponseDto>> GetAllRecipes();
        Task<RecipeResponseDto?> GetRecipeById(Guid id);
        Task<List<RecipeResponseDto>> GetRecipeByIngredients(List<Guid> ingredientIds);
        Task<RecipeResponseDto> CreateRecipe(RecipeRequest recipe);
        Task<RecipeResponseDto> UpdateRecipe(Guid id, RecipeRequest recipe);
        Task<RecipeResponseDto> SoftDeleteRecipe(Guid id);
        Task<List<RecipeSuggestionResponseDto>> SuggestRecipesBasedOnPantry(Guid accountId);
        Task<List<CalorieSuggestionResponseDto>> SuggestRecipesByCalories(double targetCalories, double tolerancePercent = 20);
    }
}
