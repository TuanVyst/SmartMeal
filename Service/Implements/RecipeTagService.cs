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
    public class RecipeTagService : IRecipeTagService
    {
        private readonly IRecipeTagRepo _repo;

        public RecipeTagService(IRecipeTagRepo repo)
        {
            _repo = repo;
        }

        public async Task<List<RecipeTagResponse>> GetAllRecipeTags()
        {
            var list = await _repo.GetAllRecipeTags();
            return list.Select(x => MapToResponse(x)).ToList();
        }

        public async Task<RecipeTagResponse?> GetRecipeTagById(Guid id)
        {
            var item = await _repo.GetRecipeTagById(id);
            if (item == null) return null;
            return MapToResponse(item);
        }

        public async Task<RecipeTagResponse> CreateRecipeTag(RecipeTagRequest request)
        {
            var item = new RecipeTag
            {
                Name = request.Name,
                Type = request.Type
            };
            var created = await _repo.CreateRecipeTag(item);
            return MapToResponse(created);
        }

        public async Task<RecipeTagResponse> UpdateRecipeTag(Guid id, RecipeTagRequest request)
        {
            var existing = await _repo.GetRecipeTagById(id);
            if (existing == null) throw new Exception("RecipeTag not found");

            existing.Name = request.Name;
            existing.Type = request.Type;

            var updated = await _repo.UpdateRecipeTag(existing);
            return MapToResponse(updated);
        }

        public async Task<RecipeTagResponse> DeleteRecipeTag(Guid id)
        {
            var deleted = await _repo.DeleteRecipeTag(id);
            return MapToResponse(deleted);
        }

        private RecipeTagResponse MapToResponse(RecipeTag item)
        {
            return new RecipeTagResponse
            {
                Rt_Id = item.Rt_Id,
                Name = item.Name,
                Type = item.Type
            };
        }
    }
}
