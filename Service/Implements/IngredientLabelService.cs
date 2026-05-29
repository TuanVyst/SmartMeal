using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System.Linq;

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
            var labels = await _ingredientLabelRepo.GetAllIngredientLabels();
            return labels.Select(MapToDto).ToList();
        }

        public async Task<IngredientLabelResponseDto?> GetIngredientLabelById(Guid id)
        {
            var label = await _ingredientLabelRepo.GetIngredientLabelById(id);
            return label == null ? null : MapToDto(label);
        }

        public async Task<IngredientLabelResponseDto> CreateIngredientLabel(IngredientLabelRequest ingredientLabel)
        {
            try
            {
                if (ingredientLabel.It_id == Guid.Empty)
                    throw new ArgumentException("Valid Tag It_id is required", nameof(ingredientLabel.It_id));
                if (ingredientLabel.Ingredient_id == Guid.Empty)
                    throw new ArgumentException("Valid Ingredient_id is required", nameof(ingredientLabel.Ingredient_id));

                var newIngredientLabel = new IngredientLabel
                {
                    Id = Guid.NewGuid(),
                    It_id = ingredientLabel.It_id,
                    Ingredient_id = ingredientLabel.Ingredient_id,
                    IsDeleted = false
                };

                var result = await _ingredientLabelRepo.CreateIngredientLabel(newIngredientLabel);
                _logger.LogInformation("IngredientLabel '{Id}' created successfully", newIngredientLabel.Id);
                return MapToDto(result ?? throw new InvalidOperationException("Failed to add ingredient label to database"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding ingredient label");
                throw;
            }
        }

        public async Task<IngredientLabelResponseDto> UpdateIngredientLabel(Guid id, IngredientLabelRequest ingredientLabel)
        {
            try
            {
                if (ingredientLabel.It_id == Guid.Empty)
                    throw new ArgumentException("Valid Tag It_id is required", nameof(ingredientLabel.It_id));
                if (ingredientLabel.Ingredient_id == Guid.Empty)
                    throw new ArgumentException("Valid Ingredient_id is required", nameof(ingredientLabel.Ingredient_id));

                var existingIngredientLabel = await _ingredientLabelRepo.GetIngredientLabelById(id);
                if (existingIngredientLabel == null)
                    throw new KeyNotFoundException($"IngredientLabel with id {id} not found");

                existingIngredientLabel.It_id = ingredientLabel.It_id;
                existingIngredientLabel.Ingredient_id = ingredientLabel.Ingredient_id;

                var result = await _ingredientLabelRepo.UpdateIngredientLabel(existingIngredientLabel);
                _logger.LogInformation("IngredientLabel '{Id}' updated successfully", existingIngredientLabel.Id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ingredient label '{Id}'", id);
                throw;
            }
        }

        public async Task<IngredientLabelResponseDto> SoftDeleteIngredientLabel(Guid id)
        {
            var result = await _ingredientLabelRepo.SoftDeleteIngredientLabel(id);
            return MapToDto(result);
        }
        
        private IngredientLabelResponseDto MapToDto(IngredientLabel label)
        {
            if (label == null) return null;
            return new IngredientLabelResponseDto
            {
                Label_id = label.Id,
                Tag_id = label.It_id,
                Ingredient_id = label.Ingredient_id,
                IsDeleted = label.IsDeleted,
                Ingredient_tag = label.Ingredient_tag != null ? new IngredientTagSimpleDto
                {
                    Tag_id = label.Ingredient_tag.It_id,
                    Name = label.Ingredient_tag.Name,
                    Category = label.Ingredient_tag.Category
                } : null,
                Ingredient = label.Ingredient != null ? new IngredientSimpleDto
                {
                    Ingredient_id = label.Ingredient.Ingredient_id,
                    Name = label.Ingredient.Name,
                    AveragePrice = label.Ingredient.AveragePrice,
                    ImageUrl = label.Ingredient.ImageUrl
                } : null
            };
        }
    }
}
