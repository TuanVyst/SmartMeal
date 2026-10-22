using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class RecipeRepo : IRecipeRepo
    {
        private readonly AppDbContext _ctx;
        private static List<Recipe>? _cachedRecipes;
        private static DateTime _cacheExpiry = DateTime.MinValue;
        private static readonly object _cacheLock = new();

        public RecipeRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public static void InvalidateCache()
        {
            lock (_cacheLock)
            {
                _cachedRecipes = null;
                _cacheExpiry = DateTime.MinValue;
            }
        }

        public async Task<List<Recipe>> GetAllRecipes()
        {
            var now = DateTime.UtcNow;
            var snapshot = _cachedRecipes;
            if (snapshot != null && now < _cacheExpiry)
            {
                return snapshot;
            }

            var list = await _ctx.Recipes
                .AsNoTracking()
                .AsSplitQuery()
                .Include(r => r.RecipeLabels.Where(rl => !rl.IsDeleted)).ThenInclude(rl => rl.RecipeTag)
                .Include(r => r.RecipeIngredients.Where(ri => !ri.IsDeleted)).ThenInclude(ri => ri.Ingredient).ThenInclude(i => i.Nutritional_value)
                .Where(i => i.IsDeleted == false)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            lock (_cacheLock)
            {
                _cachedRecipes = list;
                _cacheExpiry = DateTime.UtcNow.AddMinutes(10);
            }
            return list;
        }

        public async Task<Recipe?> GetRecipeById(Guid id)
            => await _ctx.Recipes
                .AsSplitQuery()
                .Include(r => r.RecipeLabels).ThenInclude(rl => rl.RecipeTag)
                .Include(r => r.RecipeIngredients).ThenInclude(ri => ri.Ingredient).ThenInclude(i => i.Nutritional_value)
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Recipe_id == id);

        public async Task<Recipe> CreateRecipe(Recipe recipe)
        {
            _ctx.Recipes.Add(recipe);
            await _ctx.SaveChangesAsync();
            InvalidateCache();
            return recipe;
        }

        public async Task<Recipe> UpdateRecipe(Recipe recipe)
        {
            if (_ctx.Entry(recipe).State == EntityState.Detached)
            {
                _ctx.Recipes.Update(recipe);
            }
            await _ctx.SaveChangesAsync();
            InvalidateCache();
            return recipe;
        }

        public async Task<List<Recipe>> GetRecipesByIngredientIds(List<Guid> ingredientIds)
        {
            var recipes = await _ctx.Recipes
                .AsNoTracking()
                .Where(r => r.RecipeIngredients.Any(ri => ingredientIds.Contains(ri.Ingredient_id)))
                .Include(r => r.RecipeLabels)
                .Include(r => r.SavedRecipes)
                .ToListAsync();
            return recipes;
        }

        public async Task<Recipe> SoftDeleteRecipe(Guid id)
        {
            var recipe = await _ctx.Recipes.Where(i => i.IsDeleted == false).FirstOrDefaultAsync(i => i.Recipe_id == id);
            if (recipe == null)
                throw new Exception("Recipe not found");
            recipe.IsDeleted = true;
            await _ctx.SaveChangesAsync();
            InvalidateCache();
            return recipe;
        }
    }
}
