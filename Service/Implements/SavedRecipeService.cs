using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class SavedRecipeService : ISavedRecipeService
    {
        private readonly ISavedRecipeRepo _repo;

        public SavedRecipeService(ISavedRecipeRepo repo)
        {
            _repo = repo;
        }

        public async Task<List<SavedRecipeResponse>> GetAllSavedRecipes()
        {
            var list = await _repo.GetAllSavedRecipes();
            return list.Select(x => MapToResponse(x)).ToList();
        }

        public async Task<SavedRecipeResponse?> GetSavedRecipeById(Guid id)
        {
            var item = await _repo.GetSavedRecipeById(id);
            if (item == null) return null;
            return MapToResponse(item);
        }

        public async Task<SavedRecipeResponse> CreateSavedRecipe(SavedRecipeRequest request)
        {
            var item = new SavedRecipe
            {
                Collection_Id = request.Collection_Id,
                Recipe_Id = request.Recipe_Id
            };
            var created = await _repo.CreateSavedRecipe(item);
            return MapToResponse(created);
        }

        public async Task<SavedRecipeResponse> UpdateSavedRecipe(Guid id, SavedRecipeRequest request)
        {
            var existing = await _repo.GetSavedRecipeById(id);
            if (existing == null) throw new Exception("SavedRecipe not found");

            existing.Collection_Id = request.Collection_Id;
            existing.Recipe_Id = request.Recipe_Id;

            var updated = await _repo.UpdateSavedRecipe(existing);
            return MapToResponse(updated);
        }

        public async Task<SavedRecipeResponse> DeleteSavedRecipe(Guid id)
        {
            var deleted = await _repo.DeleteSavedRecipe(id);
            return MapToResponse(deleted);
        }

        private SavedRecipeResponse MapToResponse(SavedRecipe item)
        {
            return new SavedRecipeResponse
            {
                Id = item.Id,
                Collection_Id = item.Collection_Id,
                Recipe_Id = item.Recipe_Id
            };
        }
    }
}
