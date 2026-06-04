using BusinessObject.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Repository.Interfaces
{
    public interface IRecipeTagRepo
    {
        Task<List<RecipeTag>> GetAllRecipeTags();
        Task<RecipeTag?> GetRecipeTagById(Guid id);
        Task<RecipeTag> CreateRecipeTag(RecipeTag recipeTag);
        Task<RecipeTag> UpdateRecipeTag(RecipeTag recipeTag);
        Task<RecipeTag> SoftDeleteRecipeTag(Guid id);
    }
}
