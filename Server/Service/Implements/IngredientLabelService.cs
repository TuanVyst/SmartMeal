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
    public class IngredientLabelService : IIngredientLabelService
    {
        private readonly IIngredientLabelRepo _ingredientLabelRepo;
        private readonly ILogger<IngredientLabelService> _logger;

        public IngredientLabelService(IIngredientLabelRepo ingredientLabelRepo, ILogger<IngredientLabelService> logger)
        {
            _ingredientLabelRepo = ingredientLabelRepo;
            _logger = logger;
        }

        public async Task<List<IngredientLabelResponseDto>> GetAllIngredientLabels()
        {
            var items = await _ingredientLabelRepo.GetAllIngredientLabels();
            return items.Select(MapToDto).ToList();
        }

        public async Task<IngredientLabelResponseDto?> GetIngredientLabelById(Guid id)
        {
            var item = await _ingredientLabelRepo.GetIngredientLabelById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<IngredientLabelResponseDto> CreateIngredientLabel(IngredientLabelRequest request)
        {
            try
            {
                var newItem = new IngredientLabel
                {
                    Id = Guid.NewGuid(),
                    It_id = request.It_id,
                    Ingredient_id = request.Ingredient_id,
                    IsDeleted = false
                };

                var result = await _ingredientLabelRepo.CreateIngredientLabel(newItem);
                _logger.LogInformation("IngredientLabel '{Id}' created successfully", newItem.Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating IngredientLabel");
                throw;
            }
        }

        public async Task<IngredientLabelResponseDto> UpdateIngredientLabel(Guid id, IngredientLabelRequest request)
        {
            try
            {
                var existingItem = await _ingredientLabelRepo.GetIngredientLabelById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"IngredientLabel with id {id} not found");

                existingItem.It_id = request.It_id;
                existingItem.Ingredient_id = request.Ingredient_id;

                var result = await _ingredientLabelRepo.UpdateIngredientLabel(existingItem);
                _logger.LogInformation("IngredientLabel '{Id}' updated successfully", existingItem.Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating IngredientLabel '{Id}'", id);
                throw;
            }
        }

        public async Task<IngredientLabelResponseDto> SoftDeleteIngredientLabel(Guid id)
        {
            var result = await _ingredientLabelRepo.SoftDeleteIngredientLabel(id);
            return MapToDto(result);
        }
        
        private IngredientLabelResponseDto MapToDto(IngredientLabel entity)
        {
            if (entity == null) return null;
            return new IngredientLabelResponseDto
            {
                Label_id = entity.Id,
                Tag_id = entity.It_id,
                Ingredient_id = entity.Ingredient_id,
                IsDeleted = entity.IsDeleted,
                Ingredient_tag = entity.Ingredient_tag != null ? new IngredientTagSimpleDto
                {
                    Tag_id = entity.Ingredient_tag.It_id,
                    Name = entity.Ingredient_tag.Name,
                    Category = entity.Ingredient_tag.Category
                } : null,
                Ingredient = entity.Ingredient != null ? new IngredientSimpleDto
                {
                    Ingredient_id = entity.Ingredient.Ingredient_id,
                    Name = entity.Ingredient.Name,
                    AveragePrice = entity.Ingredient.AveragePrice,
                    ImageUrl = entity.Ingredient.ImageUrl
                } : null
            };
        }
    }
}
