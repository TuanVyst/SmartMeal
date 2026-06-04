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
    public class RecipeService : IRecipeService
    {
        private readonly IRecipeRepo _recipeRepo;
        private readonly ILogger<RecipeService> _logger;

        public RecipeService(IRecipeRepo recipeRepo, ILogger<RecipeService> logger)
        {
            _recipeRepo = recipeRepo;
            _logger = logger;
        }

        public async Task<List<RecipeResponseDto>> GetAllRecipes()
        {
            var items = await _recipeRepo.GetAllRecipes();
            return items.Select(MapToDto).ToList();
        }

        public async Task<RecipeResponseDto?> GetRecipeById(Guid id)
        {
            var item = await _recipeRepo.GetRecipeById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<List<RecipeResponseDto>> GetRecipeByIngredients(List<Guid> ingredientIds)
        {
            var items = await _recipeRepo.GetRecipesByIngredientIds(ingredientIds);
            return items.Select(MapToDto).ToList();
        }
        public async Task<RecipeResponseDto> CreateRecipe(RecipeRequest request)
        {
            try
            {
                var newItem = new Recipe
                {
                    Recipe_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
                    Recipe_name = request.Recipe_name,
                    Description = request.Description,
                    Instruction = request.Instruction,
                    CookTime = request.CookTime,
                    PrepTime = request.PrepTime,
                    Servings = request.Servings,
                    Difficulty = request.Difficulty,
                    IsPublic = request.IsPublic,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var result = await _recipeRepo.CreateRecipe(newItem);
                _logger.LogInformation("Recipe '{Recipe_id}' created successfully", newItem.Recipe_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Recipe");
                throw;
            }
        }

        public async Task<RecipeResponseDto> UpdateRecipe(Guid id, RecipeRequest request)
        {
            try
            {
                var existingItem = await _recipeRepo.GetRecipeById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Recipe with id {id} not found");

                existingItem.Account_id = request.Account_id;
                existingItem.Recipe_name = request.Recipe_name;
                existingItem.Description = request.Description;
                existingItem.Instruction = request.Instruction;
                existingItem.CookTime = request.CookTime;
                existingItem.PrepTime = request.PrepTime;
                existingItem.Servings = request.Servings;
                existingItem.Difficulty = request.Difficulty;
                existingItem.IsPublic = request.IsPublic;

                var result = await _recipeRepo.UpdateRecipe(existingItem);
                _logger.LogInformation("Recipe '{Recipe_id}' updated successfully", existingItem.Recipe_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Recipe '{Recipe_id}'", id);
                throw;
            }
        }

        public async Task<RecipeResponseDto> SoftDeleteRecipe(Guid id)
        {
            var result = await _recipeRepo.SoftDeleteRecipe(id);
            return MapToDto(result);
        }
        
        private RecipeResponseDto MapToDto(Recipe entity)
        {
            if (entity == null) return null;
            return new RecipeResponseDto
            {
                Recipe_id = entity.Recipe_id,
                Account_id = entity.Account_id,
                Recipe_name = entity.Recipe_name,
                Description = entity.Description,
                Instruction = entity.Instruction,
                CookTime = entity.CookTime,
                PrepTime = entity.PrepTime,
                Servings = entity.Servings,
                Difficulty = entity.Difficulty,
                IsPublic = entity.IsPublic,
                CreatedAt = entity.CreatedAt,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
