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
    public class RecipeLabelService : IRecipeLabelService
    {
        private readonly IRecipeLabelRepo _repo;

        public RecipeLabelService(IRecipeLabelRepo repo)
        {
            _repo = repo;
        }

        public async Task<List<RecipeLabelResponse>> GetAllRecipeLabels()
        {
            var list = await _repo.GetAllRecipeLabels();
            return list.Select(x => MapToResponse(x)).ToList();
        }

        public async Task<RecipeLabelResponse?> GetRecipeLabelById(Guid id)
        {
            var item = await _repo.GetRecipeLabelById(id);
            if (item == null) return null;
            return MapToResponse(item);
        }

        public async Task<RecipeLabelResponse> CreateRecipeLabel(RecipeLabelRequest request)
        {
            var item = new RecipeLabel
            {
                Rt_Id = request.Rt_Id,
                Recipe_Id = request.Recipe_Id
            };
            var created = await _repo.CreateRecipeLabel(item);
            return MapToResponse(created);
        }

        public async Task<RecipeLabelResponse> UpdateRecipeLabel(Guid id, RecipeLabelRequest request)
        {
            var existing = await _repo.GetRecipeLabelById(id);
            if (existing == null) throw new Exception("RecipeLabel not found");

            existing.Rt_Id = request.Rt_Id;
            existing.Recipe_Id = request.Recipe_Id;

            var updated = await _repo.UpdateRecipeLabel(existing);
            return MapToResponse(updated);
        }

        public async Task<RecipeLabelResponse> DeleteRecipeLabel(Guid id)
        {
            var deleted = await _repo.DeleteRecipeLabel(id);
            return MapToResponse(deleted);
        }

        private RecipeLabelResponse MapToResponse(RecipeLabel item)
        {
            return new RecipeLabelResponse
            {
                Id = item.Id,
                Rt_Id = item.Rt_Id,
                Recipe_Id = item.Recipe_Id
            };
        }
    }
}
