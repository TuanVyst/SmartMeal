using BusinessObject.Entities;
using BusinessObject.Dtos.ResponseModels;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

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

        public async Task<List<IngredientLabelResponse>> GetAllIngredientLabels()
        {
            var ingredientLabels = await _ingredientLabelRepo.GetAllIngredientLabels();
            return ingredientLabels.Select(MapToResponse).ToList();
        }

        public async Task<IngredientLabelResponse?> GetIngredientLabelById(Guid id)
        {
            var ingredientLabel = await _ingredientLabelRepo.GetIngredientLabelById(id);
            return ingredientLabel == null ? null : MapToResponse(ingredientLabel);
        }

        public async Task<IngredientLabelResponse> CreateIngredientLabel(IngredientLabelRequest ingredientLabel)
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
                return result == null
                    ? throw new InvalidOperationException("Failed to add ingredient label to database")
                    : MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding ingredient label");
                throw;
            }
        }

        public async Task<IngredientLabelResponse> UpdateIngredientLabel(Guid id, IngredientLabelRequest ingredientLabel)
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
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ingredient label '{Id}'", id);
                throw;
            }
        }

        public async Task<IngredientLabelResponse> SoftDeleteIngredientLabel(Guid id)
        {
            var result = await _ingredientLabelRepo.SoftDeleteIngredientLabel(id);
            return MapToResponse(result);
        }

        private static IngredientLabelResponse MapToResponse(IngredientLabel ingredientLabel)
        {
            return new IngredientLabelResponse
            {
                Id = ingredientLabel.Id,
                It_id = ingredientLabel.It_id,
                Ingredient_id = ingredientLabel.Ingredient_id,
                IsDeleted = ingredientLabel.IsDeleted
            };
        }
    }
}
