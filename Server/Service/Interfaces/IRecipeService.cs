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
        Task<RecipeResponseDto> CreateRecipe(RecipeRequest recipe);
        Task<RecipeResponseDto> UpdateRecipe(Guid id, RecipeRequest recipe);
        Task<RecipeResponseDto> SoftDeleteRecipe(Guid id);
        Task<List<RecipeSuggestionResponseDto>> SuggestRecipesBasedOnPantry(Guid accountId);
    }
}
