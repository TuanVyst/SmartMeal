using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IRecipeTagRepo
    {
        Task<List<RecipeTag>> GetAllRecipeTags();
        Task<RecipeTag?> GetRecipeTagById(Guid id);
        Task<RecipeTag> CreateRecipeTag(RecipeTag recipeTag);
        Task<RecipeTag> UpdateRecipeTag(RecipeTag recipeTag);
        Task<RecipeTag> DeleteRecipeTag(Guid id);
    }
}
