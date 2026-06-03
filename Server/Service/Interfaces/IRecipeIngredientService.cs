using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRecipeIngredientService
    {
        Task<List<RecipeIngredientResponse>> GetAllRecipeIngredients();
        Task<RecipeIngredientResponse?> GetRecipeIngredientById(Guid id);
        Task<RecipeIngredientResponse> CreateRecipeIngredient(RecipeIngredientRequest request);
        Task<RecipeIngredientResponse> UpdateRecipeIngredient(Guid id, RecipeIngredientRequest request);
        Task<RecipeIngredientResponse> DeleteRecipeIngredient(Guid id);
    }
}
