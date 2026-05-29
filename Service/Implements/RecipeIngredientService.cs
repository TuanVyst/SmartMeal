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
    public class RecipeIngredientService : IRecipeIngredientService
    {
        private readonly IRecipeIngredientRepo _repo;

        public RecipeIngredientService(IRecipeIngredientRepo repo)
        {
            _repo = repo;
        }

        public async Task<List<RecipeIngredientResponse>> GetAllRecipeIngredients()
        {
            var list = await _repo.GetAllRecipeIngredients();
            return list.Select(x => MapToResponse(x)).ToList();
        }

        public async Task<RecipeIngredientResponse?> GetRecipeIngredientById(Guid id)
        {
            var item = await _repo.GetRecipeIngredientById(id);
            if (item == null) return null;
            return MapToResponse(item);
        }

        public async Task<RecipeIngredientResponse> CreateRecipeIngredient(RecipeIngredientRequest request)
        {
            var item = new RecipeIngredient
            {
                Recipe_id = request.Recipe_id,
                Ingredient_id = request.Ingredient_id,
                Quantity = request.Quantity,
                UOM = request.UOM
            };
            var created = await _repo.CreateRecipeIngredient(item);
            return MapToResponse(created);
        }

        public async Task<RecipeIngredientResponse> UpdateRecipeIngredient(Guid id, RecipeIngredientRequest request)
        {
            var existing = await _repo.GetRecipeIngredientById(id);
            if (existing == null) throw new Exception("RecipeIngredient not found");

            existing.Recipe_id = request.Recipe_id;
            existing.Ingredient_id = request.Ingredient_id;
            existing.Quantity = request.Quantity;
            existing.UOM = request.UOM;

            var updated = await _repo.UpdateRecipeIngredient(existing);
            return MapToResponse(updated);
        }

        public async Task<RecipeIngredientResponse> DeleteRecipeIngredient(Guid id)
        {
            var deleted = await _repo.DeleteRecipeIngredient(id);
            return MapToResponse(deleted);
        }

        private RecipeIngredientResponse MapToResponse(RecipeIngredient item)
        {
            return new RecipeIngredientResponse
            {
                RI_id = item.RI_id,
                Recipe_id = item.Recipe_id,
                Ingredient_id = item.Ingredient_id,
                Quantity = item.Quantity,
                UOM = item.UOM
            };
        }
    }
}
