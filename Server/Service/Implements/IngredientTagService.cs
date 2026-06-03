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
    public class IngredientTagService : IIngredientTagService
    {
        private readonly IIngredientTagRepo _ingredientTagRepo;
        private readonly ILogger<IngredientTagService> _logger;

        public IngredientTagService(IIngredientTagRepo ingredientTagRepo, ILogger<IngredientTagService> logger)
        {
            _ingredientTagRepo = ingredientTagRepo;
            _logger = logger;
        }

        public async Task<List<IngredientTagResponseDto>> GetAllIngredientTags()
        {
            var items = await _ingredientTagRepo.GetAllIngredientTags();
            return items.Select(MapToDto).ToList();
        }

        public async Task<IngredientTagResponseDto?> GetIngredientTagById(Guid id)
        {
            var item = await _ingredientTagRepo.GetIngredientTagById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<IngredientTagResponseDto> CreateIngredientTag(IngredientTagRequest request)
        {
            try
            {
                var newItem = new IngredientTag
                {
                    It_id = Guid.NewGuid(),
                    Name = request.Name,
                    Category = request.Category,
                    IsDeleted = false
                };

                var result = await _ingredientTagRepo.CreateIngredientTag(newItem);
                _logger.LogInformation("IngredientTag '{It_id}' created successfully", newItem.It_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating IngredientTag");
                throw;
            }
        }

        public async Task<IngredientTagResponseDto> UpdateIngredientTag(Guid id, IngredientTagRequest request)
        {
            try
            {
                var existingItem = await _ingredientTagRepo.GetIngredientTagById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"IngredientTag with id {id} not found");

                existingItem.Name = request.Name;
                existingItem.Category = request.Category;

                var result = await _ingredientTagRepo.UpdateIngredientTag(existingItem);
                _logger.LogInformation("IngredientTag '{It_id}' updated successfully", existingItem.It_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating IngredientTag '{It_id}'", id);
                throw;
            }
        }

        public async Task<IngredientTagResponseDto> SoftDeleteIngredientTag(Guid id)
        {
            var result = await _ingredientTagRepo.SoftDeleteIngredientTag(id);
            return MapToDto(result);
        }
        
        private IngredientTagResponseDto MapToDto(IngredientTag entity)
        {
            if (entity == null) return null;
            return new IngredientTagResponseDto
            {
                Tag_id = entity.It_id,
                Name = entity.Name,
                Category = entity.Category,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
