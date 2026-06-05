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
        private readonly ILogger<RecipeService> _logger;

        public RecipeService(IRecipeRepo recipeRepo, IPantryRepo pantryRepo, IIngredientRepo ingredientRepo, IRecipeIngredientRepo recipeIngredientRepo, ILogger<RecipeService> logger)
        {
            _recipeRepo = recipeRepo;
            _pantryRepo = pantryRepo;
            _ingredientRepo = ingredientRepo;
            _recipeIngredientRepo = recipeIngredientRepo;
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

        public async Task<RecipeResponseDto> CreateRecipe(RecipeRequest request)
        {
            try
            {
                var newItem = new Recipe
                {
                    Recipe_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
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

                var result = await _recipeRepo.CreateRecipe(newItem);
                _logger.LogInformation("Recipe '{Recipe_id}' created successfully", newItem.Recipe_id);
                return MapToDto(result);
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

                existingItem.Account_id = request.Account_id;
                existingItem.Recipe_name = request.Recipe_name;
                existingItem.Description = request.Description;
                existingItem.Instruction = request.Instruction;
                existingItem.CookTime = request.CookTime;
                existingItem.PrepTime = request.PrepTime;
                existingItem.Servings = request.Servings;
                existingItem.Difficulty = request.Difficulty;
                existingItem.IsPublic = request.IsPublic;

                var result = await _recipeRepo.UpdateRecipe(existingItem);
                _logger.LogInformation("Recipe '{Recipe_id}' updated successfully", existingItem.Recipe_id);
                return MapToDto(result);
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
                    var missing = new List<string>();
                    var allIngDetails = new List<IngredientStatusDto>();

                    foreach (var ri in recipeIngs)
                    {
                        var ingName = ingredientDict.ContainsKey(ri.Ingredient_id) ? ingredientDict[ri.Ingredient_id] : "Unknown";
                        bool isPossessed = userIngredientIds.Contains(ri.Ingredient_id);

                        allIngDetails.Add(new IngredientStatusDto
                        {
                            Name = ingName,
                            Possessed = isPossessed
                        });

                        if (isPossessed)
                        {
                            matchCount++;
                        }
                        else
                        {
                            missing.Add(ingName);
                        }
                    }

                    double matchPercentage = (double)matchCount / recipeIngs.Count * 100;

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
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
