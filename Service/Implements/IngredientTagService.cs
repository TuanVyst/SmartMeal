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
    public class IngredientTagService : IIngredientTagService
    {
        private readonly IIngredientTagRepo _ingredientTagRepo;
        private readonly ILogger<IngredientTagService> _logger;

        public IngredientTagService(IIngredientTagRepo ingredientTagRepo, ILogger<IngredientTagService> logger)
        {
            _ingredientTagRepo = ingredientTagRepo;
            _logger = logger;
        }

        public async Task<List<IngredientTag>> GetAllIngredientTags()
        {
            return await _ingredientTagRepo.GetAllIngredientTags();
        }

        public async Task<IngredientTag?> GetIngredientTagById(Guid id)
        {
            return await _ingredientTagRepo.GetIngredientTagById(id);
        }

        public async Task<IngredientTag> CreateIngredientTag(IngredientTagRequest ingredientTag)
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
                return result ?? throw new InvalidOperationException("Failed to add ingredient tag to database");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding ingredient tag");
                throw;
            }
        }

        public async Task<IngredientTag> UpdateIngredientTag(IngredientTag ingredientTag)
        {
            return await _ingredientTagRepo.UpdateIngredientTag(ingredientTag);
        }

        public async Task<IngredientTag> SoftDeleteIngredientTag(Guid id)
        {
            return await _ingredientTagRepo.SoftDeleteIngredientTag(id);
        }
    }
}
