using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IRecipeIngredientRepo
    {
        Task<List<RecipeIngredient>> GetAllRecipeIngredients();
        Task<RecipeIngredient?> GetRecipeIngredientById(Guid id);
        Task<RecipeIngredient> CreateRecipeIngredient(RecipeIngredient recipeIngredient);
        Task<RecipeIngredient> UpdateRecipeIngredient(RecipeIngredient recipeIngredient);
        Task<RecipeIngredient> SoftDeleteRecipeIngredient(Guid id);
    }
}
