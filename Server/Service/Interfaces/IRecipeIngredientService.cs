using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRecipeIngredientService
    {
        Task<List<RecipeIngredientResponseDto>> GetAllRecipeIngredients();
        Task<RecipeIngredientResponseDto?> GetRecipeIngredientById(Guid id);
        Task<RecipeIngredientResponseDto> CreateRecipeIngredient(RecipeIngredientRequest recipeIngredient);
        Task<RecipeIngredientResponseDto> UpdateRecipeIngredient(Guid id, RecipeIngredientRequest recipeIngredient);
        Task<RecipeIngredientResponseDto> SoftDeleteRecipeIngredient(Guid id);
    }
}
