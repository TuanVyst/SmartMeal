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
    public class IngredientTagService : IIngredientTagService
    {
        private readonly IIngredientTagRepo _ingredientTagRepo;
        private readonly ILogger<IngredientTagService> _logger;

        public IngredientTagService(IIngredientTagRepo ingredientTagRepo, ILogger<IngredientTagService> logger)
        {
            _ingredientTagRepo = ingredientTagRepo;
            _logger = logger;
        }

        public async Task<List<IngredientTagResponse>> GetAllIngredientTags()
        {
            var ingredientTags = await _ingredientTagRepo.GetAllIngredientTags();
            return ingredientTags.Select(MapToResponse).ToList();
        }

        public async Task<IngredientTagResponse?> GetIngredientTagById(Guid id)
        {
            var ingredientTag = await _ingredientTagRepo.GetIngredientTagById(id);
            return ingredientTag == null ? null : MapToResponse(ingredientTag);
        }

        public async Task<IngredientTagResponse> CreateIngredientTag(IngredientTagRequest ingredientTag)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ingredientTag.Name))
                    throw new ArgumentException("Name is required", nameof(ingredientTag.Name));
                if (ingredientTag.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(ingredientTag.Name));
                if (string.IsNullOrWhiteSpace(ingredientTag.Category))
                    throw new ArgumentException("Category is required", nameof(ingredientTag.Category));
                
                var newIngredientTag = new IngredientTag
                {
                    It_id = Guid.NewGuid(),
                    Name = ingredientTag.Name,
                    Category = ingredientTag.Category,
                    IsDeleted = false
                };

                var result = await _ingredientTagRepo.CreateIngredientTag(newIngredientTag);
                _logger.LogInformation("IngredientTag '{It_id}' ({Name}) created successfully", newIngredientTag.It_id, newIngredientTag.Name);
                return result == null
                    ? throw new InvalidOperationException("Failed to add ingredient tag to database")
                    : MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding ingredient tag");
                throw;
            }
        }

        public async Task<IngredientTagResponse> UpdateIngredientTag(Guid id, IngredientTagRequest ingredientTag)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ingredientTag.Name))
                    throw new ArgumentException("Name is required", nameof(ingredientTag.Name));
                if (ingredientTag.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(ingredientTag.Name));
                if (string.IsNullOrWhiteSpace(ingredientTag.Category))
                    throw new ArgumentException("Category is required", nameof(ingredientTag.Category));
                
                var existingIngredientTag = await _ingredientTagRepo.GetIngredientTagById(id);
                if (existingIngredientTag == null)
                    throw new KeyNotFoundException($"IngredientTag with id {id} not found");

                existingIngredientTag.Name = ingredientTag.Name;
                existingIngredientTag.Category = ingredientTag.Category;

                var result = await _ingredientTagRepo.UpdateIngredientTag(existingIngredientTag);
                _logger.LogInformation("IngredientTag '{It_id}' updated successfully", existingIngredientTag.It_id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ingredient tag '{It_id}'", id);
                throw;
            }
        }

        public async Task<IngredientTagResponse> SoftDeleteIngredientTag(Guid id)
        {
            var result = await _ingredientTagRepo.SoftDeleteIngredientTag(id);
            return MapToResponse(result);
        }

        private static IngredientTagResponse MapToResponse(IngredientTag ingredientTag)
        {
            return new IngredientTagResponse
            {
                It_id = ingredientTag.It_id,
                Name = ingredientTag.Name,
                Category = ingredientTag.Category,
                IsDeleted = ingredientTag.IsDeleted
            };
        }
    }
}
