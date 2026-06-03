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
    public class RecipeLabelService : IRecipeLabelService
    {
        private readonly IRecipeLabelRepo _recipeLabelRepo;
        private readonly ILogger<RecipeLabelService> _logger;

        public RecipeLabelService(IRecipeLabelRepo recipeLabelRepo, ILogger<RecipeLabelService> logger)
        {
            _recipeLabelRepo = recipeLabelRepo;
            _logger = logger;
        }

        public async Task<List<RecipeLabelResponseDto>> GetAllRecipeLabels()
        {
            var items = await _recipeLabelRepo.GetAllRecipeLabels();
            return items.Select(MapToDto).ToList();
        }

        public async Task<RecipeLabelResponseDto?> GetRecipeLabelById(Guid id)
        {
            var item = await _recipeLabelRepo.GetRecipeLabelById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<RecipeLabelResponseDto> CreateRecipeLabel(RecipeLabelRequest request)
        {
            try
            {
                var newItem = new RecipeLabel
                {
                    Id = Guid.NewGuid(),
                    Rt_Id = request.Rt_Id,
                    Recipe_Id = request.Recipe_Id,
                    IsDeleted = false
                };

                var result = await _recipeLabelRepo.CreateRecipeLabel(newItem);
                _logger.LogInformation("RecipeLabel '{Id}' created successfully", newItem.Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating RecipeLabel");
                throw;
            }
        }

        public async Task<RecipeLabelResponseDto> UpdateRecipeLabel(Guid id, RecipeLabelRequest request)
        {
            try
            {
                var existingItem = await _recipeLabelRepo.GetRecipeLabelById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"RecipeLabel with id {id} not found");

                existingItem.Rt_Id = request.Rt_Id;
                existingItem.Recipe_Id = request.Recipe_Id;

                var result = await _recipeLabelRepo.UpdateRecipeLabel(existingItem);
                _logger.LogInformation("RecipeLabel '{Id}' updated successfully", existingItem.Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating RecipeLabel '{Id}'", id);
                throw;
            }
        }

        public async Task<RecipeLabelResponseDto> SoftDeleteRecipeLabel(Guid id)
        {
            var result = await _recipeLabelRepo.SoftDeleteRecipeLabel(id);
            return MapToDto(result);
        }
        
        private RecipeLabelResponseDto MapToDto(RecipeLabel entity)
        {
            if (entity == null) return null;
            return new RecipeLabelResponseDto
            {
                Id = entity.Id,
                Rt_Id = entity.Rt_Id,
                Recipe_Id = entity.Recipe_Id,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
