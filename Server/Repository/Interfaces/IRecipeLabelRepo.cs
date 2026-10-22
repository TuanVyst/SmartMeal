using BusinessObject.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Repository.Interfaces
{
    public interface IRecipeLabelRepo
    {
        Task<List<RecipeLabel>> GetAllRecipeLabels();
        Task<RecipeLabel?> GetRecipeLabelById(Guid id);
        Task<RecipeLabel> CreateRecipeLabel(RecipeLabel recipeLabel);
        Task CreateRecipeLabels(List<RecipeLabel> recipeLabels);
        Task<RecipeLabel> UpdateRecipeLabel(RecipeLabel recipeLabel);
        Task<RecipeLabel> SoftDeleteRecipeLabel(Guid id);
    }
}
