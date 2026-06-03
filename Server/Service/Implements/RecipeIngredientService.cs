using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class RecipeIngredientService : IRecipeIngredientService
    {
        private readonly IRecipeIngredientRepo _recipeIngredientRepo;
        private readonly ILogger<RecipeIngredientService> _logger;

        public RecipeIngredientService(IRecipeIngredientRepo recipeIngredientRepo, ILogger<RecipeIngredientService> logger)
        {
            _recipeIngredientRepo = recipeIngredientRepo;
            _logger = logger;
        }

        public async Task<List<RecipeIngredientResponseDto>> GetAllRecipeIngredients()
        {
            var recipeIngredients = await _recipeIngredientRepo.GetAllRecipeIngredients();
            return recipeIngredients.Select(MapToDto).ToList();
        }

        public async Task<RecipeIngredientResponseDto?> GetRecipeIngredientById(Guid id)
        {
            var recipeIngredient = await _recipeIngredientRepo.GetRecipeIngredientById(id);
            return recipeIngredient == null ? null : MapToDto(recipeIngredient);
        }

        public async Task<RecipeIngredientResponseDto> CreateRecipeIngredient(RecipeIngredientRequest request)
        {
            try
            {
                var newRecipeIngredient = new RecipeIngredient
                {
                    RI_id = Guid.NewGuid(),
                    Recipe_id = request.Recipe_id,
                    Ingredient_id = request.Ingredient_id,
                    Quantity = request.Quantity,
                    UOM = request.UOM,
                    IsDeleted = false
                };

                var result = await _recipeIngredientRepo.CreateRecipeIngredient(newRecipeIngredient);
                _logger.LogInformation("RecipeIngredient '{RI_id}' created successfully", newRecipeIngredient.RI_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating RecipeIngredient");
                throw;
            }
        }

        public async Task<RecipeIngredientResponseDto> UpdateRecipeIngredient(Guid id, RecipeIngredientRequest request)
        {
            try
            {
                var existingItem = await _recipeIngredientRepo.GetRecipeIngredientById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"RecipeIngredient with id {id} not found");

                existingItem.Recipe_id = request.Recipe_id;
                existingItem.Ingredient_id = request.Ingredient_id;
                existingItem.Quantity = request.Quantity;
                existingItem.UOM = request.UOM;

                var result = await _recipeIngredientRepo.UpdateRecipeIngredient(existingItem);
                _logger.LogInformation("RecipeIngredient '{RI_id}' updated successfully", existingItem.RI_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating RecipeIngredient '{RI_id}'", id);
                throw;
            }
        }

        public async Task<RecipeIngredientResponseDto> SoftDeleteRecipeIngredient(Guid id)
        {
            var result = await _recipeIngredientRepo.SoftDeleteRecipeIngredient(id);
            return MapToDto(result);
        }
        
        private RecipeIngredientResponseDto MapToDto(RecipeIngredient entity)
        {
            if (entity == null) return null;
            return new RecipeIngredientResponseDto
            {
                RI_id = entity.RI_id,
                Recipe_id = entity.Recipe_id,
                Ingredient_id = entity.Ingredient_id,
                Quantity = entity.Quantity,
                UOM = entity.UOM,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
