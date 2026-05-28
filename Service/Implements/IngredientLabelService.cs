using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
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

        public async Task<List<IngredientLabel>> GetAllIngredientLabels()
        {
            return await _ingredientLabelRepo.GetAllIngredientLabels();
        }

        public async Task<IngredientLabel?> GetIngredientLabelById(Guid id)
        {
            return await _ingredientLabelRepo.GetIngredientLabelById(id);
        }

        public async Task<IngredientLabel> CreateIngredientLabel(IngredientLabelRequest ingredientLabel)
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
                return result ?? throw new InvalidOperationException("Failed to add ingredient label to database");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding ingredient label");
                throw;
            }
        }

        public async Task<IngredientLabel> UpdateIngredientLabel(IngredientLabel ingredientLabel)
        {
            return await _ingredientLabelRepo.UpdateIngredientLabel(ingredientLabel);
        }

        public async Task<IngredientLabel> SoftDeleteIngredientLabel(Guid id)
        {
            return await _ingredientLabelRepo.SoftDeleteIngredientLabel(id);
        }
    }
}
