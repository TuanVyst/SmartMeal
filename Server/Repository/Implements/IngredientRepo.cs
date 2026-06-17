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
        public IngredientRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Ingredient>> GetAllIngredients()
        {
            return await _ctx.Ingredients
                .Include(i => i.Nutritional_value)
                .Include(i => i.AffiliateProducts)
                .Include(i => i.Recipe_Ingredients)
                .Include(i => i.IngredientLabels).ThenInclude(il => il.Ingredient_tag)
                .Include(i => i.GroceryItems)
                .Include(i => i.Pantries)
                .Include(i => i.Allergy)
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Ingredient?> GetIngredientById(Guid id)
            => await _ctx.Ingredients
                .Include(i => i.Nutritional_value)
                .Include(i => i.AffiliateProducts)
                .Include(i => i.Recipe_Ingredients)
                .Include(i => i.IngredientLabels).ThenInclude(il => il.Ingredient_tag)
                .Include(i => i.GroceryItems)
                .Include(i => i.Pantries)
                .Include(i => i.Allergy)
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Ingredient_id == id);

        public async Task<Ingredient> CreateIngredient(Ingredient ingredient)
        {
            _ctx.Ingredients.Add(ingredient);
            await _ctx.SaveChangesAsync();
            return ingredient;
        }

        public async Task<Ingredient> UpdateIngredient(Ingredient ingredient)
        {
            _ctx.Ingredients.Update(ingredient);
            await _ctx.SaveChangesAsync();
            return ingredient;
        }

        public async Task<Ingredient> SoftDeleteIngredient(Guid id)
        {
            var ingredient = _ctx.Ingredients.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Ingredient_id == id);
            if (ingredient == null)
                throw new Exception("Ingredient not found");
            ingredient.IsDeleted = true;
            _ctx.Ingredients.Update(ingredient);
            await _ctx.SaveChangesAsync();
            return ingredient;
        }
    }
}
