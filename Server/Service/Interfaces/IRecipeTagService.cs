using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRecipeTagService
    {
        Task<List<RecipeTagResponseDto>> GetAllRecipeTags();
        Task<RecipeTagResponseDto?> GetRecipeTagById(Guid id);
        Task<RecipeTagResponseDto> CreateRecipeTag(RecipeTagRequest recipeTag);
        Task<RecipeTagResponseDto> UpdateRecipeTag(Guid id, RecipeTagRequest recipeTag);
        Task<RecipeTagResponseDto> SoftDeleteRecipeTag(Guid id);
    }
}
