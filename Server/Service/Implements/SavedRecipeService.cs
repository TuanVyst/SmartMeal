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
    public class SavedRecipeService : ISavedRecipeService
    {
        private readonly ISavedRecipeRepo _savedRecipeRepo;
        private readonly ILogger<SavedRecipeService> _logger;

        public SavedRecipeService(ISavedRecipeRepo savedRecipeRepo, ILogger<SavedRecipeService> logger)
        {
            _savedRecipeRepo = savedRecipeRepo;
            _logger = logger;
        }

        public async Task<List<SavedRecipeResponseDto>> GetAllSavedRecipes()
        {
            var items = await _savedRecipeRepo.GetAllSavedRecipes();
            return items.Select(MapToDto).ToList();
        }

        public async Task<SavedRecipeResponseDto?> GetSavedRecipeById(Guid id)
        {
            var item = await _savedRecipeRepo.GetSavedRecipeById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<List<SavedRecipeResponseDto>> GetSavedRecipesByCollectionId(Guid collectionId)
        {
            var items = await _savedRecipeRepo.GetSavedRecipesByCollectionId(collectionId);
            return items.Select(MapToDto).ToList();
        }

        public async Task<bool> ToggleSavedRecipe(Guid collectionId, Guid recipeId)
        {
            var existing = await _savedRecipeRepo.GetSavedRecipeByCollectionAndRecipe(collectionId, recipeId);
            
            if (existing != null)
            {
                if (existing.IsDeleted)
                {
                    existing.IsDeleted = false;
                    await _savedRecipeRepo.UpdateSavedRecipe(existing);
                    return true; // Added (restored)
                }
                else
                {
                    existing.IsDeleted = true;
                    await _savedRecipeRepo.UpdateSavedRecipe(existing);
                    return false; // Removed
                }
            }
            else
            {
                var newSaved = new SavedRecipe
                {
                    Id = Guid.NewGuid(),
                    Collection_Id = collectionId,
                    Recipe_Id = recipeId,
                    IsDeleted = false
                };
                await _savedRecipeRepo.CreateSavedRecipe(newSaved);
                return true; // Added
            }
        }

        public async Task<SavedRecipeResponseDto> CreateSavedRecipe(SavedRecipeRequest request)
        {
            try
            {
                var newItem = new SavedRecipe
                {
                    Id = Guid.NewGuid(),
                    Collection_Id = request.Collection_Id,
                    Recipe_Id = request.Recipe_Id,
                    IsDeleted = false
                };

                var result = await _savedRecipeRepo.CreateSavedRecipe(newItem);
                _logger.LogInformation("SavedRecipe '{Id}' created successfully", newItem.Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating SavedRecipe");
                throw;
            }
        }

        public async Task<SavedRecipeResponseDto> UpdateSavedRecipe(Guid id, SavedRecipeRequest request)
        {
            try
            {
                var existingItem = await _savedRecipeRepo.GetSavedRecipeById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"SavedRecipe with id {id} not found");

                existingItem.Collection_Id = request.Collection_Id;
                existingItem.Recipe_Id = request.Recipe_Id;

                var result = await _savedRecipeRepo.UpdateSavedRecipe(existingItem);
                _logger.LogInformation("SavedRecipe '{Id}' updated successfully", existingItem.Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating SavedRecipe '{Saved_id}'", id);
                throw;
            }
        }

        public async Task<SavedRecipeResponseDto> SoftDeleteSavedRecipe(Guid id)
        {
            var result = await _savedRecipeRepo.SoftDeleteSavedRecipe(id);
            return MapToDto(result);
        }
        
        private SavedRecipeResponseDto MapToDto(SavedRecipe entity)
        {
            if (entity == null) return null;
            return new SavedRecipeResponseDto
            {
                Saved_id = entity.Id,
                Collection_id = entity.Collection_Id,
                Recipe_id = entity.Recipe_Id,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
