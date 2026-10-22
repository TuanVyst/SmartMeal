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
    public class IngredientRepo : IIngredientRepo
    {
        private readonly AppDbContext _ctx;
        private static List<Ingredient>? _cachedIngredients;
        private static DateTime _cacheExpiry = DateTime.MinValue;
        private static readonly object _cacheLock = new();

        public IngredientRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public static void InvalidateCache()
        {
            lock (_cacheLock)
            {
                _cachedIngredients = null;
                _cacheExpiry = DateTime.MinValue;
            }
            RecipeRepo.InvalidateCache();
        }

        public async Task<List<Ingredient>> GetAllIngredients()
        {
            var now = DateTime.UtcNow;
            var snapshot = _cachedIngredients;
            if (snapshot != null && now < _cacheExpiry)
            {
                return snapshot;
            }

            var list = await _ctx.Ingredients
                .AsNoTracking()
                .AsSplitQuery()
                .Include(i => i.Nutritional_value)
                .Include(i => i.IngredientLabels.Where(il => !il.IsDeleted)).ThenInclude(il => il.Ingredient_tag)
                .Where(i => i.IsDeleted == false)
                .OrderBy(i => i.Name)
                .ToListAsync();

            lock (_cacheLock)
            {
                _cachedIngredients = list;
                _cacheExpiry = DateTime.UtcNow.AddMinutes(10);
            }
            return list;
        }

        public async Task<Ingredient?> GetIngredientById(Guid id)
            => await _ctx.Ingredients
                .Include(i => i.Nutritional_value)
                .Include(i => i.IngredientLabels).ThenInclude(il => il.Ingredient_tag)
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Ingredient_id == id);

        public async Task<Ingredient> CreateIngredient(Ingredient ingredient)
        {
            _ctx.Ingredients.Add(ingredient);
            await _ctx.SaveChangesAsync();
            InvalidateCache();
            return ingredient;
        }

        public async Task<Ingredient> UpdateIngredient(Ingredient ingredient)
        {
            if (_ctx.Entry(ingredient).State == EntityState.Detached)
            {
                _ctx.Ingredients.Update(ingredient);
            }
            await _ctx.SaveChangesAsync();
            InvalidateCache();
            return ingredient;
        }

        public async Task<Ingredient> SoftDeleteIngredient(Guid id)
        {
            var ingredient = await _ctx.Ingredients.Where(i => i.IsDeleted == false).FirstOrDefaultAsync(i => i.Ingredient_id == id);
            if (ingredient == null)
                throw new Exception("Ingredient not found");
            ingredient.IsDeleted = true;
            await _ctx.SaveChangesAsync();
            InvalidateCache();
            return ingredient;
        }
    }
}
