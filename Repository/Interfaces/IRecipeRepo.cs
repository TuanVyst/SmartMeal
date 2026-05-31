using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IRecipeRepo
    {
        Task<List<Recipe>> GetAllRecipes();
        Task<Recipe?> GetRecipeById(Guid id);
        Task<Recipe> CreateRecipe(Recipe recipe);
        Task<Recipe> UpdateRecipe(Recipe recipe);
        Task<Recipe> DeleteRecipe(Guid id);
    }
}
