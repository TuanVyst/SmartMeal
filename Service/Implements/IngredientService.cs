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
    public class IngredientService : IIngredientService
    {
        private readonly IIngredientRepo _ingredientRepo;
        private readonly ILogger<IngredientService> _logger;

        public IngredientService(IIngredientRepo ingredientRepo, ILogger<IngredientService> logger)
        {
            _ingredientRepo = ingredientRepo;
            _logger = logger;
        }

        public async Task<List<Ingredient>> GetAllIngredients()
        {
            return await _ingredientRepo.GetAllIngredients();
        }

        public async Task<Ingredient?> GetIngredientById(Guid id)
        {
            return await _ingredientRepo.GetIngredientById(id);
        }

        public async Task<Ingredient> CreateIngredient(IngredientRequest ingredient)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ingredient.Name))
                    throw new ArgumentException("Name is required", nameof(ingredient.Name));
                if (ingredient.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(ingredient.Name));
                if (ingredient.AveragePrice < 0)
                    throw new ArgumentException("AveragePrice cannot be negative", nameof(ingredient.AveragePrice));

                var newIngredient = new Ingredient
                {
                    Ingredient_id = Guid.NewGuid(),
                    Name = ingredient.Name,
                    AveragePrice = ingredient.AveragePrice,
                    ImageUrl = ingredient.ImageUrl,
                    IsDeleted = false
                };

                var result = await _ingredientRepo.CreateIngredient(newIngredient);
                _logger.LogInformation("Ingredient '{Ingredient_id}' ({Name}) created successfully", newIngredient.Ingredient_id, newIngredient.Name);
                return result ?? throw new InvalidOperationException("Failed to add ingredient to database");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding ingredient");
                throw;
            }
        }

        public async Task<Ingredient> UpdateIngredient(Guid id, IngredientRequest ingredient)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ingredient.Name))
                    throw new ArgumentException("Name is required", nameof(ingredient.Name));
                if (ingredient.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(ingredient.Name));
                if (ingredient.AveragePrice < 0)
                    throw new ArgumentException("AveragePrice cannot be negative", nameof(ingredient.AveragePrice));

                var existingIngredient = await _ingredientRepo.GetIngredientById(id);
                if (existingIngredient == null)
                    throw new KeyNotFoundException($"Ingredient with id {id} not found");

                existingIngredient.Name = ingredient.Name;
                existingIngredient.AveragePrice = ingredient.AveragePrice;
                existingIngredient.ImageUrl = ingredient.ImageUrl;

                var result = await _ingredientRepo.UpdateIngredient(existingIngredient);
                _logger.LogInformation("Ingredient '{Ingredient_id}' updated successfully", existingIngredient.Ingredient_id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ingredient '{Ingredient_id}'", id);
                throw;
            }
        }

        public async Task<Ingredient> SoftDeleteIngredient(Guid id)
        {
            return await _ingredientRepo.SoftDeleteIngredient(id);
        }
    }
}
