using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface ISavedRecipeRepo
    {
        Task<List<SavedRecipe>> GetAllSavedRecipes();
        Task<SavedRecipe?> GetSavedRecipeById(Guid id);
        Task<SavedRecipe?> GetSavedRecipeByCollectionAndRecipe(Guid collectionId, Guid recipeId);
        Task<List<SavedRecipe>> GetSavedRecipesByCollectionId(Guid collectionId);
        Task<SavedRecipe> CreateSavedRecipe(SavedRecipe savedRecipe);
        Task<SavedRecipe> UpdateSavedRecipe(SavedRecipe savedRecipe);
        Task<SavedRecipe> SoftDeleteSavedRecipe(Guid id);
    }
}
