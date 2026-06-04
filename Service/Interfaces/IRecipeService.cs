using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRecipeService
    {
        Task<List<RecipeResponse>> GetAllRecipes();
        Task<RecipeResponse?> GetRecipeById(Guid id);
        Task<RecipeResponse> CreateRecipe(RecipeRequest request);
        Task<List<RecipeResponse>> GetRecipesByIngredientIds(List<Guid> ingredientIds);
        Task<RecipeResponse> UpdateRecipe(Guid id, RecipeRequest request);
        Task<RecipeResponse> DeleteRecipe(Guid id);
    }
}
