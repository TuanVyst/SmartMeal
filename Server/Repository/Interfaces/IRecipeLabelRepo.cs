using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IRecipeLabelRepo
    {
        Task<List<RecipeLabel>> GetAllRecipeLabels();
        Task<RecipeLabel?> GetRecipeLabelById(Guid id);
        Task<RecipeLabel> CreateRecipeLabel(RecipeLabel recipeLabel);
        Task<RecipeLabel> UpdateRecipeLabel(RecipeLabel recipeLabel);
        Task<RecipeLabel> DeleteRecipeLabel(Guid id);
    }
}
