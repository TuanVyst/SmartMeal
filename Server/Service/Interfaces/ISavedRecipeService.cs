using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ISavedRecipeService
    {
        Task<List<SavedRecipeResponseDto>> GetAllSavedRecipes();
        Task<SavedRecipeResponseDto?> GetSavedRecipeById(Guid id);
        Task<SavedRecipeResponseDto> CreateSavedRecipe(SavedRecipeRequest savedRecipe);
        Task<SavedRecipeResponseDto> UpdateSavedRecipe(Guid id, SavedRecipeRequest savedRecipe);
        Task<SavedRecipeResponseDto> SoftDeleteSavedRecipe(Guid id);
    }
}
