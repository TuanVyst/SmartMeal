using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface ISavedRecipeRepo
    {
        Task<List<SavedRecipe>> GetAllSavedRecipes();
        Task<SavedRecipe?> GetSavedRecipeById(Guid id);
        Task<SavedRecipe> CreateSavedRecipe(SavedRecipe savedRecipe);
        Task<SavedRecipe> UpdateSavedRecipe(SavedRecipe savedRecipe);
        Task<SavedRecipe> DeleteSavedRecipe(Guid id);
    }
}
