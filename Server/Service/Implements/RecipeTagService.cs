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
    public class RecipeTagService : IRecipeTagService
    {
        private readonly IRecipeTagRepo _recipeTagRepo;
        private readonly ILogger<RecipeTagService> _logger;

        public RecipeTagService(IRecipeTagRepo recipeTagRepo, ILogger<RecipeTagService> logger)
        {
            _recipeTagRepo = recipeTagRepo;
            _logger = logger;
        }

        public async Task<List<RecipeTagResponseDto>> GetAllRecipeTags()
        {
            var items = await _recipeTagRepo.GetAllRecipeTags();
            return items.Select(MapToDto).ToList();
        }

        public async Task<RecipeTagResponseDto?> GetRecipeTagById(Guid id)
        {
            var item = await _recipeTagRepo.GetRecipeTagById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<RecipeTagResponseDto> CreateRecipeTag(RecipeTagRequest request)
        {
            try
            {
                var newItem = new RecipeTag
                {
                    Rt_Id = Guid.NewGuid(),
                    Name = request.Name,
                    Type = request.Type,
                    IsDeleted = false
                };

                var result = await _recipeTagRepo.CreateRecipeTag(newItem);
                _logger.LogInformation("RecipeTag '{Rt_Id}' created successfully", newItem.Rt_Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating RecipeTag");
                throw;
            }
        }

        public async Task<RecipeTagResponseDto> UpdateRecipeTag(Guid id, RecipeTagRequest request)
        {
            try
            {
                var existingItem = await _recipeTagRepo.GetRecipeTagById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"RecipeTag with id {id} not found");

                existingItem.Name = request.Name;
                existingItem.Type = request.Type;

                var result = await _recipeTagRepo.UpdateRecipeTag(existingItem);
                _logger.LogInformation("RecipeTag '{Rt_Id}' updated successfully", existingItem.Rt_Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating RecipeTag '{Rt_Id}'", id);
                throw;
            }
        }

        public async Task<RecipeTagResponseDto> SoftDeleteRecipeTag(Guid id)
        {
            var result = await _recipeTagRepo.SoftDeleteRecipeTag(id);
            return MapToDto(result);
        }
        
        private RecipeTagResponseDto MapToDto(RecipeTag entity)
        {
            if (entity == null) return null;
            return new RecipeTagResponseDto
            {
                Rt_Id = entity.Rt_Id,
                Name = entity.Name,
                Type = entity.Type,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
