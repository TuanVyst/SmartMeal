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

                var distinctTagIds = ingredient.IngredientTagIds?
                    .Distinct()
                    .ToList() ?? new List<Guid>();

                if (!distinctTagIds.Any())
                    throw new ArgumentException("At least one ingredient tag id is required");

                // Validate tags exist in a single query
                var allTags = await _ingredientTagRepo.GetAllIngredientTags();
                var tagMap = allTags.ToDictionary(t => t.It_id);
                var existingTags = new List<IngredientTag>(distinctTagIds.Count);
                foreach (var tid in distinctTagIds)
                {
                    if (!tagMap.TryGetValue(tid, out var t))
                        throw new ArgumentException($"Invalid ingredient tag id: {tid}");
                    existingTags.Add(t);
                }

                var newIngredientId = Guid.NewGuid();
                var createdLabels = existingTags.Select(tag => new IngredientLabel
                {
                    Id = Guid.NewGuid(),
                    Ingredient_id = newIngredientId,
                    It_id = tag.It_id,
                    IsDeleted = false
                }).ToList();

                NutritionalValue? nv = null;
                if (ingredient.NutritionalValue != null)
                {
                    nv = new NutritionalValue
                    {
                        Nv_id = Guid.NewGuid(),
                        Ingredient_id = newIngredientId,
                        Calories = ingredient.NutritionalValue.Calories,
                        Protein = ingredient.NutritionalValue.Protein,
                        Carbs = ingredient.NutritionalValue.Carbohydrates,
                        Fat = ingredient.NutritionalValue.Fat,
                        Fiber = ingredient.NutritionalValue.Fiber,
                        Sugar = ingredient.NutritionalValue.Sugar,
                        Salt = ingredient.NutritionalValue.Sodium,
                        Cholesterol = ingredient.NutritionalValue.Cholesterol,
                        ServingSize = ingredient.NutritionalValue.ServingSize ?? 100.0,
                        ServingUnit = ingredient.NutritionalValue.ServingUnit ?? "g",
                        EverydayUnit = ingredient.NutritionalValue.EverydayUnit,
                        EverydayWeight = ingredient.NutritionalValue.EverydayWeight,
                        IsDeleted = false
                    };
                }

                var newIngredient = new Ingredient
                {
                    Ingredient_id = newIngredientId,
                    Name = ingredient.Name,
                    AveragePrice = ingredient.AveragePrice,
                    ImageUrl = ingredient.ImageUrl,
                    IsDeleted = false,
                    Nutritional_value = nv,
                    IngredientLabels = createdLabels
                };

                var result = await _ingredientRepo.CreateIngredient(newIngredient)
                    ?? throw new InvalidOperationException("Failed to add ingredient to database");

                foreach (var label in createdLabels)
                {
                    if (tagMap.TryGetValue(label.It_id, out var tag))
                    {
                        label.Ingredient_tag = tag;
                    }
                }

                _logger.LogInformation("Ingredient '{Ingredient_id}' ({Name}) with {LabelCount} labels created successfully", newIngredient.Ingredient_id, newIngredient.Name, createdLabels.Count);
                return MapToDto(result);
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

                // Update existing NutritionalValue in memory before single SaveChangesAsync
                NutritionalValue? newNvToCreate = null;
                if (ingredient.NutritionalValue != null)
                {
                    var nv = existingIngredient.Nutritional_value;
                    if (nv == null)
                    {
                        newNvToCreate = new NutritionalValue
                        {
                            Nv_id = Guid.NewGuid(),
                            Ingredient_id = existingIngredient.Ingredient_id,
                            Calories = ingredient.NutritionalValue.Calories,
                            Protein = ingredient.NutritionalValue.Protein,
                            Carbs = ingredient.NutritionalValue.Carbohydrates,
                            Fat = ingredient.NutritionalValue.Fat,
                            Fiber = ingredient.NutritionalValue.Fiber,
                            Sugar = ingredient.NutritionalValue.Sugar,
                            Salt = ingredient.NutritionalValue.Sodium,
                            Cholesterol = ingredient.NutritionalValue.Cholesterol,
                            ServingSize = ingredient.NutritionalValue.ServingSize ?? 100.0,
                            ServingUnit = ingredient.NutritionalValue.ServingUnit ?? "g",
                            EverydayUnit = ingredient.NutritionalValue.EverydayUnit,
                            EverydayWeight = ingredient.NutritionalValue.EverydayWeight,
                            IsDeleted = false
                        };
                    }
                    else
                    {
                        nv.Calories = ingredient.NutritionalValue.Calories;
                        nv.Protein = ingredient.NutritionalValue.Protein;
                        nv.Carbs = ingredient.NutritionalValue.Carbohydrates;
                        nv.Fat = ingredient.NutritionalValue.Fat;
                        nv.Fiber = ingredient.NutritionalValue.Fiber;
                        nv.Sugar = ingredient.NutritionalValue.Sugar;
                        nv.Salt = ingredient.NutritionalValue.Sodium;
                        nv.Cholesterol = ingredient.NutritionalValue.Cholesterol;
                        nv.ServingSize = ingredient.NutritionalValue.ServingSize ?? nv.ServingSize;
                        nv.ServingUnit = ingredient.NutritionalValue.ServingUnit ?? nv.ServingUnit;
                        nv.EverydayUnit = ingredient.NutritionalValue.EverydayUnit ?? nv.EverydayUnit;
                        nv.EverydayWeight = ingredient.NutritionalValue.EverydayWeight ?? nv.EverydayWeight;
                    }
                }

                Dictionary<Guid, IngredientTag>? tagMap = null;
                var newLabelsToCreate = new List<IngredientLabel>();

                if (ingredient.IngredientTagIds != null)
                {
                    var distinctTagIds = ingredient.IngredientTagIds.Distinct().ToList();
                    var allTags = await _ingredientTagRepo.GetAllIngredientTags();
                    tagMap = allTags.ToDictionary(t => t.It_id);

                    foreach (var tagId in distinctTagIds)
                    {
                        if (!tagMap.ContainsKey(tagId))
                            throw new ArgumentException($"Invalid ingredient tag: {tagId}");
                    }

                    var currentLabels = existingIngredient.IngredientLabels ?? new List<IngredientLabel>();
                    var currentActiveLabels = currentLabels.Where(l => !l.IsDeleted).ToList();
                    var currentActiveTagIds = currentActiveLabels.Select(l => l.It_id).ToHashSet();
                    var requestedTagIdSet = distinctTagIds.ToHashSet();

                    var tagIdsToAdd = distinctTagIds.Where(tid => !currentActiveTagIds.Contains(tid)).ToList();
                    var labelsToRemove = currentActiveLabels.Where(l => !requestedTagIdSet.Contains(l.It_id)).ToList();

                    foreach (var label in labelsToRemove)
                    {
                        label.IsDeleted = true;
                    }

                    foreach (var tagId in tagIdsToAdd)
                    {
                        var softDeletedLabel = currentLabels.FirstOrDefault(l => l.IsDeleted && l.It_id == tagId);
                        if (softDeletedLabel != null)
                        {
                            softDeletedLabel.IsDeleted = false;
                        }
                        else
                        {
                            newLabelsToCreate.Add(new IngredientLabel
                            {
                                Id = Guid.NewGuid(),
                                Ingredient_id = existingIngredient.Ingredient_id,
                                It_id = tagId,
                                IsDeleted = false
                            });
                        }
                    }
                }

                await _ingredientRepo.UpdateIngredient(existingIngredient);

                if (newNvToCreate != null)
                {
                    await _nutritionalValueRepo.CreateNutritionalValue(newNvToCreate);
                    existingIngredient.Nutritional_value = newNvToCreate;
                }

                if (newLabelsToCreate.Count > 0)
                {
                    existingIngredient.IngredientLabels ??= new List<IngredientLabel>();
                    foreach (var newLabel in newLabelsToCreate)
                    {
                        await _ingredientLabelRepo.CreateIngredientLabel(newLabel);
                        if (!existingIngredient.IngredientLabels.Any(l => l.Id == newLabel.Id))
                        {
                            existingIngredient.IngredientLabels.Add(newLabel);
                        }
                    }
                }

                if (tagMap != null && existingIngredient.IngredientLabels != null)
                {
                    foreach (var label in existingIngredient.IngredientLabels.Where(l => !l.IsDeleted))
                    {
                        if (label.Ingredient_tag == null && tagMap.TryGetValue(label.It_id, out var tag))
                        {
                            label.Ingredient_tag = tag;
                        }
                    }
                }

                _logger.LogInformation("Ingredient '{Ingredient_id}' updated successfully", id);
                return MapToDto(existingIngredient);
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
                    Protein = ingredient.Nutritional_value.Protein,
                    Carbs = ingredient.Nutritional_value.Carbs,
                    Carbohydrates = ingredient.Nutritional_value.Carbs,
                    Fat = ingredient.Nutritional_value.Fat,
                    Fiber = ingredient.Nutritional_value.Fiber,
                    Sugar = ingredient.Nutritional_value.Sugar,
                    Salt = ingredient.Nutritional_value.Salt,
                    Cholesterol = ingredient.Nutritional_value.Cholesterol,
                    ServingSize = ingredient.Nutritional_value.ServingSize,
                    ServingUnit = ingredient.Nutritional_value.ServingUnit,
                    EverydayUnit = ingredient.Nutritional_value.EverydayUnit,
                    EverydayWeight = ingredient.Nutritional_value.EverydayWeight
                } : null,
                IngredientLabels = ingredient.IngredientLabels?.Where(l => !l.IsDeleted).Select(l => new IngredientLabelSimpleDto
                {
                    Label_id = l.Id,
                    LabelName = l.Ingredient_tag?.Name
                }).ToList()
            };
        }
    }
}
