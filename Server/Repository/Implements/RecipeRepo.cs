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
        public RecipeRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Recipe>> GetAllRecipes()
        {
            return await _ctx.Recipes
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Recipe?> GetRecipeById(Guid id)
            => await _ctx.Recipes
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Recipe_id == id);

        public async Task<Recipe> CreateRecipe(Recipe recipe)
        {
            _ctx.Recipes.Add(recipe);
            await _ctx.SaveChangesAsync();
            return recipe;
        }

        public async Task<Recipe> UpdateRecipe(Recipe recipe)
        {
            _ctx.Recipes.Update(recipe);
            await _ctx.SaveChangesAsync();
            return recipe;
        }

        public async Task<Recipe> SoftDeleteRecipe(Guid id)
        {
            var recipe = _ctx.Recipes.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Recipe_id == id);
            if (recipe == null)
                throw new Exception("Recipe not found");
            recipe.IsDeleted = true;
            _ctx.Recipes.Update(recipe);
            await _ctx.SaveChangesAsync();
            return recipe;
        }
    }
}
