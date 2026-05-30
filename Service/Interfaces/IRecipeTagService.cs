using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRecipeTagService
    {
        Task<List<RecipeTagResponse>> GetAllRecipeTags();
        Task<RecipeTagResponse?> GetRecipeTagById(Guid id);
        Task<RecipeTagResponse> CreateRecipeTag(RecipeTagRequest request);
        Task<RecipeTagResponse> UpdateRecipeTag(Guid id, RecipeTagRequest request);
        Task<RecipeTagResponse> DeleteRecipeTag(Guid id);
    }
}
