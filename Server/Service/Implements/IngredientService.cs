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
    public class IngredientService : IIngredientService
    {
        private readonly IIngredientRepo _ingredientRepo;
        private readonly IIngredientLabelRepo _ingredientLabelRepo;
        private readonly INutritionalValueRepo _nutritionalValueRepo;
        private readonly IIngredientTagRepo _ingredientTagRepo;
        private readonly ILogger<IngredientService> _logger;

        public IngredientService(IIngredientRepo ingredientRepo, ILogger<IngredientService> logger, IIngredientLabelRepo ingredientLabelRepo, INutritionalValueRepo nutritionalValueRepo, IIngredientTagRepo ingredientTagRepo)
        {
            _ingredientRepo = ingredientRepo;
            _logger = logger;
            _ingredientLabelRepo = ingredientLabelRepo;
            _nutritionalValueRepo = nutritionalValueRepo;
            _ingredientTagRepo = ingredientTagRepo;
        }

        public async Task<List<IngredientResponseDto>> GetAllIngredients()
        {
            var ingredients = await _ingredientRepo.GetAllIngredients();
            return ingredients.Select(MapToDto).ToList();
        }

        public async Task<IngredientResponseDto?> GetIngredientById(Guid id)
        {
            var ingredient = await _ingredientRepo.GetIngredientById(id);
            return ingredient == null ? null : MapToDto(ingredient);
        }

        public async Task<IngredientResponseDto> CreateIngredient(IngredientRequest ingredient)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ingredient.Name))
                    throw new ArgumentException("Name is required", nameof(ingredient.Name));
                if (ingredient.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(ingredient.Name));
                if (ingredient.AveragePrice < 0)
                    throw new ArgumentException("AveragePrice cannot be negative", nameof(ingredient.AveragePrice));

                var existingTag = await _ingredientTagRepo.GetIngredientTagById(Guid.Parse(ingredient.IngredientTagId));
                if (existingTag == null)
                    throw new ArgumentException("Invalid ingredient tag");

                var newIngredient = new Ingredient
                {
                    Ingredient_id = Guid.NewGuid(),
                    Name = ingredient.Name,
                    AveragePrice = ingredient.AveragePrice,
                    ImageUrl = ingredient.ImageUrl,
                    IsDeleted = false
                };

                var newIngredientLabel = new IngredientLabel
                {
                    Id = Guid.NewGuid(),
                    Ingredient_id = newIngredient.Ingredient_id,
                  
                };

                var result = await _ingredientRepo.CreateIngredient(newIngredient);
                _logger.LogInformation("Ingredient '{Ingredient_id}' ({Name}) created successfully", newIngredient.Ingredient_id, newIngredient.Name);
                return MapToDto(result ?? throw new InvalidOperationException("Failed to add ingredient to database"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding ingredient");
                throw;
            }
        }

        public async Task<IngredientResponseDto> UpdateIngredient(Guid id, IngredientRequest ingredient)
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
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ingredient '{Ingredient_id}'", id);
                throw;
            }
        }

        public async Task<IngredientResponseDto> SoftDeleteIngredient(Guid id)
        {
            var result = await _ingredientRepo.SoftDeleteIngredient(id);
            return MapToDto(result);
        }
        
        private IngredientResponseDto MapToDto(Ingredient ingredient)
        {
            if (ingredient == null) return null;
            return new IngredientResponseDto
            {
                Ingredient_id = ingredient.Ingredient_id,
                Name = ingredient.Name,
                AveragePrice = ingredient.AveragePrice,
                ImageUrl = ingredient.ImageUrl,
                IsDeleted = ingredient.IsDeleted,
                Nutritional_value = ingredient.Nutritional_value != null ? new NutritionalValueSimpleDto
                {
                    Id = ingredient.Nutritional_value.Nv_id,
                    Calories = ingredient.Nutritional_value.Calories,
                    
                } : null,
                IngredientLabels = ingredient.IngredientLabels?.Select(l => new IngredientLabelSimpleDto
                {
                    Label_id = l.Id,
                    LabelName = l.Ingredient_tag?.Name
                }).ToList()
            };
        }
    }
}
