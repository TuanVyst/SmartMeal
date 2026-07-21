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
    public class RecipeService : IRecipeService
    {
        private readonly IRecipeRepo _recipeRepo;
        private readonly IPantryRepo _pantryRepo;
        private readonly IIngredientRepo _ingredientRepo;
        private readonly IRecipeIngredientRepo _recipeIngredientRepo;
        private readonly IRecipeTagRepo _recipeTagRepo;
        private readonly IRecipeLabelRepo _recipeLabelRepo;
        private readonly ILogger<RecipeService> _logger;

        public RecipeService(IRecipeRepo recipeRepo, IPantryRepo pantryRepo, IIngredientRepo ingredientRepo, IRecipeIngredientRepo recipeIngredientRepo, IRecipeTagRepo recipeTagRepo, IRecipeLabelRepo recipeLabelRepo, ILogger<RecipeService> logger)
        {
            _recipeRepo = recipeRepo;
            _pantryRepo = pantryRepo;
            _ingredientRepo = ingredientRepo;
            _recipeIngredientRepo = recipeIngredientRepo;
            _recipeTagRepo = recipeTagRepo;
            _recipeLabelRepo = recipeLabelRepo;
            _logger = logger;
        }

        public async Task<List<RecipeResponseDto>> GetAllRecipes()
        {
            var items = await _recipeRepo.GetAllRecipes();
            return items.Select(MapToDto).ToList();
        }

        public async Task<RecipeResponseDto?> GetRecipeById(Guid id)
        {
            var item = await _recipeRepo.GetRecipeById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<List<RecipeResponseDto>> GetRecipeByIngredients(List<Guid> ingredientIds)
        {
            var items = await _recipeRepo.GetRecipesByIngredientIds(ingredientIds);
            return items.Select(MapToDto).ToList();
        }
        public async Task<RecipeResponseDto> CreateRecipe(RecipeRequest request)
        {
            try
            {
                if (request.RecipeTagIds == null || !request.RecipeTagIds.Any())
                    throw new ArgumentException("At least one recipe tag must be provided to create a recipe");

                var tags = new List<RecipeTag>();
                foreach (var tagId in request.RecipeTagIds)
                {
                    var existingTag = await _recipeTagRepo.GetRecipeTagById(tagId);
                    if (existingTag == null)
                        throw new ArgumentException($"Invalid recipe tag: {tagId}");
                    tags.Add(existingTag);
                }

                Guid authorId = request.Account_id;
                if (authorId == Guid.Empty)
                {
                    var existingRecipes = await _recipeRepo.GetAllRecipes();
                    authorId = existingRecipes.FirstOrDefault()?.Account_id ?? Guid.Empty;
                }

                var newItem = new Recipe
                {
                    Recipe_id = Guid.NewGuid(),
                    Account_id = authorId,
                    Recipe_name = request.Recipe_name,
                    Description = request.Description,
                    Instruction = request.Instruction,
                    CookTime = request.CookTime,
                    PrepTime = request.PrepTime,
                    Servings = request.Servings,
                    Difficulty = request.Difficulty,
                    IsPublic = request.IsPublic,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var newRecipeLabels = tags.Select(t => new RecipeLabel
                {
                    Id = Guid.NewGuid(),
                    Recipe_Id = newItem.Recipe_id,
                    Rt_Id = t.Rt_Id,
                    IsDeleted = false
                }).ToList();

                var result = await _recipeRepo.CreateRecipe(newItem);
                foreach (var label in newRecipeLabels)
                {
                    await _recipeLabelRepo.CreateRecipeLabel(label);
                }

                var createdRecipe = await _recipeRepo.GetRecipeById(newItem.Recipe_id);
                _logger.LogInformation("Recipe '{Recipe_id}' created successfully with {TagCount} tags", newItem.Recipe_id, tags.Count);
                return MapToDto(createdRecipe ?? throw new InvalidOperationException("Failed to add recipe to database"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Recipe");
                throw;
            }
        }

        public async Task<RecipeResponseDto> UpdateRecipe(Guid id, RecipeRequest request)
        {
            try
            {
                var existingItem = await _recipeRepo.GetRecipeById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Recipe with id {id} not found");

                if (request.RecipeTagIds != null && !request.RecipeTagIds.Any())
                    throw new ArgumentException("A recipe must have at least one label");

                if (request.Account_id != Guid.Empty)
                {
                    existingItem.Account_id = request.Account_id;
                }
                existingItem.Recipe_name = request.Recipe_name;
                existingItem.Description = request.Description;
                existingItem.Instruction = request.Instruction;
                existingItem.CookTime = request.CookTime;
                existingItem.PrepTime = request.PrepTime;
                existingItem.Servings = request.Servings;
                existingItem.Difficulty = request.Difficulty;
                existingItem.IsPublic = request.IsPublic;

                await _recipeRepo.UpdateRecipe(existingItem);

                if (request.RecipeTagIds != null)
                {
                    var tags = new List<RecipeTag>();
                    foreach (var tagId in request.RecipeTagIds)
                    {
                        var existingTag = await _recipeTagRepo.GetRecipeTagById(tagId);
                        if (existingTag == null)
                            throw new ArgumentException($"Invalid recipe tag: {tagId}");
                        tags.Add(existingTag);
                    }

                    var currentLabels = existingItem.RecipeLabels ?? new List<RecipeLabel>();
                    var currentActiveLabels = currentLabels.Where(l => !l.IsDeleted).ToList();
                    var currentActiveTagIds = currentActiveLabels.Select(l => l.Rt_Id).ToHashSet();

                    var tagIdsToAdd = request.RecipeTagIds.Where(tid => !currentActiveTagIds.Contains(tid)).ToList();
                    var labelsToRemove = currentActiveLabels.Where(l => !request.RecipeTagIds.Contains(l.Rt_Id)).ToList();

                    foreach (var label in labelsToRemove)
                    {
                        await _recipeLabelRepo.SoftDeleteRecipeLabel(label.Id);
                    }

                    foreach (var tagId in tagIdsToAdd)
                    {
                        var softDeletedLabel = currentLabels.FirstOrDefault(l => l.IsDeleted && l.Rt_Id == tagId);
                        if (softDeletedLabel != null)
                        {
                            softDeletedLabel.IsDeleted = false;
                            await _recipeLabelRepo.UpdateRecipeLabel(softDeletedLabel);
                        }
                        else
                        {
                            var newLabel = new RecipeLabel
                            {
                                Id = Guid.NewGuid(),
                                Recipe_Id = existingItem.Recipe_id,
                                Rt_Id = tagId,
                                IsDeleted = false
                            };
                            await _recipeLabelRepo.CreateRecipeLabel(newLabel);
                        }
                    }
                }

                var updatedRecipe = await _recipeRepo.GetRecipeById(id);
                _logger.LogInformation("Recipe '{Recipe_id}' updated successfully", id);
                return MapToDto(updatedRecipe);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Recipe '{Recipe_id}'", id);
                throw;
            }
        }

        public async Task<RecipeResponseDto> SoftDeleteRecipe(Guid id)
        {
            var result = await _recipeRepo.SoftDeleteRecipe(id);
            return MapToDto(result);
        }
        
        public async Task<List<CalorieSuggestionResponseDto>> SuggestRecipesByCalories(double targetCalories, double tolerancePercent = 20)
        {
            try
            {
                var allRecipes = await _recipeRepo.GetAllRecipes();

                var suggestions = new List<CalorieSuggestionResponseDto>();
                double tolerance = tolerancePercent / 100.0;
                double lowerBound = targetCalories * (1 - tolerance);
                double upperBound = targetCalories * (1 + tolerance);

                foreach (var recipe in allRecipes)
                {
                    var recipeIngs = recipe.RecipeIngredients?
                        .Where(ri => !ri.IsDeleted)
                        .ToList();

                    if (recipeIngs == null || !recipeIngs.Any()) continue;

                    double totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0;
                    double totalFib = 0, totalSug = 0, totalSod = 0, totalChol = 0;

                    foreach (var ri in recipeIngs)
                    {
                        var nv = ri.Ingredient?.Nutritional_value;
                        if (nv == null) continue;

                        var servingSize = nv.ServingSize ?? 100.0;
                        if (servingSize <= 0) servingSize = 100.0;
                        var multiplier = ri.Quantity / servingSize;

                        totalCal += nv.Calories * multiplier;
                        totalPro += (nv.Protein ?? 0) * multiplier;
                        totalCarb += (nv.Carbs ?? 0) * multiplier;
                        totalFat += (nv.Fat ?? 0) * multiplier;
                        totalFib += (nv.Fiber ?? 0) * multiplier;
                        totalSug += (nv.Sugar ?? 0) * multiplier;
                        totalSod += (nv.Salt ?? 0) * multiplier;
                        totalChol += (nv.Cholesterol ?? 0) * multiplier;
                    }

                    int servings = recipe.Servings > 0 ? recipe.Servings : 1;
                    double calPerServing = totalCal / servings;

                    double deviation = targetCalories > 0
                        ? Math.Abs(calPerServing - targetCalories) / targetCalories * 100
                        : 0;
                    double matchPercent = Math.Max(0, 100 - deviation);

                    suggestions.Add(new CalorieSuggestionResponseDto
                    {
                        Recipe_id = recipe.Recipe_id,
                        Account_id = recipe.Account_id,
                        Recipe_name = recipe.Recipe_name,
                        Description = recipe.Description,
                        Instruction = recipe.Instruction,
                        CookTime = recipe.CookTime,
                        PrepTime = recipe.PrepTime,
                        Servings = recipe.Servings,
                        Difficulty = recipe.Difficulty,
                        TotalCalories = Math.Round(totalCal, 1),
                        CaloriesPerServing = Math.Round(calPerServing, 1),
                        TotalProtein = Math.Round(totalPro, 1),
                        TotalCarbs = Math.Round(totalCarb, 1),
                        TotalFat = Math.Round(totalFat, 1),
                        TotalFiber = Math.Round(totalFib, 1),
                        TotalSugar = Math.Round(totalSug, 1),
                        TotalSalt = Math.Round(totalSod, 1),
                        TotalCholesterol = Math.Round(totalChol, 1),
                        TargetCalories = targetCalories,
                        CalorieDeviation = Math.Round(deviation, 1),
                        CalorieMatchPercent = Math.Round(matchPercent, 1)
                    });
                }

                var filtered = suggestions
                    .Where(s => s.CaloriesPerServing >= lowerBound && s.CaloriesPerServing <= upperBound)
                    .OrderBy(s => s.CalorieDeviation)
                    .ThenByDescending(s => s.CalorieMatchPercent)
                    .ToList();

                if (!filtered.Any())
                {
                    filtered = suggestions
                        .OrderBy(s => s.CalorieDeviation)
                        .Take(10)
                        .ToList();
                }

                return filtered;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suggesting recipes by calories");
                throw;
            }
        }

        public async Task<List<RecipeSuggestionResponseDto>> SuggestRecipesBasedOnPantry(Guid accountId)
        {
            try
            {
                // 1. Get user's pantry
                var allPantries = await _pantryRepo.GetAllPantries();
                var userPantry = allPantries.Where(p => p.Account_id == accountId).ToList();
                var userIngredientIds = userPantry.Select(p => p.Ingredient_id).ToHashSet();

                // 2. Get all recipes
                var allRecipes = await _recipeRepo.GetAllRecipes();

                // 3. Get all recipe ingredients and map to recipes
                var allRecipeIngredients = await _recipeIngredientRepo.GetAllRecipeIngredients();
                var allIngredients = await _ingredientRepo.GetAllIngredients();
                var ingredientDict = allIngredients.ToDictionary(i => i.Ingredient_id, i => i.Name);

                var suggestions = new List<RecipeSuggestionResponseDto>();

                foreach (var recipe in allRecipes)
                {
                    var recipeIngs = allRecipeIngredients.Where(ri => ri.Recipe_id == recipe.Recipe_id).ToList();
                    
                    if (!recipeIngs.Any()) continue;

                    int matchCount = 0;
                    bool missingPrimary = false;
                    var missing = new List<string>();
                    var allIngDetails = new List<IngredientStatusDto>();

                    foreach (var ri in recipeIngs)
                    {
                        var ingName = ingredientDict.ContainsKey(ri.Ingredient_id) ? ingredientDict[ri.Ingredient_id] : "Unknown";
                        bool isPossessed = userIngredientIds.Contains(ri.Ingredient_id);

                        allIngDetails.Add(new IngredientStatusDto
                        {
                            Name = ingName,
                            Possessed = isPossessed,
                            IsPrimary = ri.IsPrimary
                        });

                        if (isPossessed)
                        {
                            matchCount++;
                        }
                        else
                        {
                            missing.Add(ingName);
                            if (ri.IsPrimary)
                            {
                                missingPrimary = true;
                            }
                        }
                    }

                    double matchPercentage = missingPrimary ? 0 : ((double)matchCount / recipeIngs.Count * 100);

                    suggestions.Add(new RecipeSuggestionResponseDto
                    {
                        Recipe_id = recipe.Recipe_id,
                        Recipe_name = recipe.Recipe_name,
                        Description = recipe.Description,
                        CookTime = recipe.CookTime,
                        PrepTime = recipe.PrepTime,
                        Difficulty = recipe.Difficulty,
                        MatchPercentage = Math.Round(matchPercentage, 0),
                        MissingIngredients = missing,
                        AllIngredients = allIngDetails
                    });
                }

                // Sort by highest match percentage
                return suggestions.OrderByDescending(s => s.MatchPercentage).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suggesting recipes based on pantry for account {AccountId}", accountId);
                throw;
            }
        }
        
        private RecipeResponseDto MapToDto(Recipe entity)
        {
            if (entity == null) return null;
            return new RecipeResponseDto
            {
                Recipe_id = entity.Recipe_id,
                Account_id = entity.Account_id,
                Recipe_name = entity.Recipe_name,
                Description = entity.Description,
                Instruction = entity.Instruction,
                CookTime = entity.CookTime,
                PrepTime = entity.PrepTime,
                Servings = entity.Servings,
                Difficulty = entity.Difficulty,
                IsPublic = entity.IsPublic,
                CreatedAt = entity.CreatedAt,
                IsDeleted = entity.IsDeleted,
                RecipeLabels = entity.RecipeLabels?.Where(l => !l.IsDeleted).Select(l => new RecipeLabelSimpleDto
                {
                    Label_id = l.Id,
                    LabelName = l.RecipeTag?.Name
                }).ToList(),
                RecipeIngredients = entity.RecipeIngredients?.Where(ri => !ri.IsDeleted).Select(ri => new RecipeIngredientResponseDto
                {
                    Ingredient_id = ri.Ingredient_id,
                    Name = ri.Ingredient?.Name ?? "",
                    Quantity = ri.Quantity,
                    Uom = ri.UOM ?? "",
                    IsPrimary = ri.IsPrimary,
                    NutritionalValue = ri.Ingredient?.Nutritional_value == null ? null : new NutritionalValueSimpleDto
                    {
                        Id = ri.Ingredient.Nutritional_value.Nv_id,
                        Calories = ri.Ingredient.Nutritional_value.Calories,
                        Protein = ri.Ingredient.Nutritional_value.Protein,
                        Carbohydrates = ri.Ingredient.Nutritional_value.Carbs,
                        Carbs = ri.Ingredient.Nutritional_value.Carbs,
                        Fat = ri.Ingredient.Nutritional_value.Fat,
                        Fiber = ri.Ingredient.Nutritional_value.Fiber,
                        Sugar = ri.Ingredient.Nutritional_value.Sugar,
                        Salt = ri.Ingredient.Nutritional_value.Salt,
                        Cholesterol = ri.Ingredient.Nutritional_value.Cholesterol,
                        ServingSize = ri.Ingredient.Nutritional_value.ServingSize,
                        ServingUnit = ri.Ingredient.Nutritional_value.ServingUnit
                    }
                }).ToList()
            };
        }
    }
}
