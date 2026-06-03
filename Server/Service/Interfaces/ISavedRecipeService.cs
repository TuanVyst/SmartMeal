using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ISavedRecipeService
    {
        Task<List<SavedRecipeResponse>> GetAllSavedRecipes();
        Task<SavedRecipeResponse?> GetSavedRecipeById(Guid id);
        Task<SavedRecipeResponse> CreateSavedRecipe(SavedRecipeRequest request);
        Task<SavedRecipeResponse> UpdateSavedRecipe(Guid id, SavedRecipeRequest request);
        Task<SavedRecipeResponse> DeleteSavedRecipe(Guid id);
    }
}
