using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class RecipeService : IRecipeService
    {
        private readonly IRecipeRepo _recipeRepo;

        public RecipeService(IRecipeRepo recipeRepo)
        {
            _recipeRepo = recipeRepo;
        }

        public async Task<List<RecipeResponse>> GetAllRecipes()
        {
            var recipes = await _recipeRepo.GetAllRecipes();
            return recipes.Select(r => MapToResponse(r)).ToList();
        }

        public async Task<RecipeResponse?> GetRecipeById(Guid id)
        {
            var recipe = await _recipeRepo.GetRecipeById(id);
            if (recipe == null) return null;
            return MapToResponse(recipe);
        }

        public async Task<RecipeResponse> CreateRecipe(RecipeRequest request)
        {
            var recipe = new Recipe
            {
                Account_id = request.Account_id,
                Recipe_name = request.Recipe_name,
                Description = request.Description,
                Instruction = request.Instruction,
                CookTime = request.CookTime,
                PrepTime = request.PrepTime,
                Servings = request.Servings,
                Difficulty = request.Difficulty,
                IsPublic = request.IsPublic
            };

            var createdRecipe = await _recipeRepo.CreateRecipe(recipe);
            return MapToResponse(createdRecipe);
        }

        public async Task<RecipeResponse> UpdateRecipe(Guid id, RecipeRequest request)
        {
            var existingRecipe = await _recipeRepo.GetRecipeById(id);
            if (existingRecipe == null)
                throw new Exception("Recipe not found");

            existingRecipe.Account_id = request.Account_id;
            existingRecipe.Recipe_name = request.Recipe_name;
            existingRecipe.Description = request.Description;
            existingRecipe.Instruction = request.Instruction;
            existingRecipe.CookTime = request.CookTime;
            existingRecipe.PrepTime = request.PrepTime;
            existingRecipe.Servings = request.Servings;
            existingRecipe.Difficulty = request.Difficulty;
            existingRecipe.IsPublic = request.IsPublic;

            var updatedRecipe = await _recipeRepo.UpdateRecipe(existingRecipe);
            return MapToResponse(updatedRecipe);
        }

        public async Task<RecipeResponse> DeleteRecipe(Guid id)
        {
            var deletedRecipe = await _recipeRepo.DeleteRecipe(id);
            return MapToResponse(deletedRecipe);
        }

        private RecipeResponse MapToResponse(Recipe recipe)
        {
            return new RecipeResponse
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
                IsPublic = recipe.IsPublic,
                CreatedAt = recipe.CreatedAt
            };
        }
    }
}
