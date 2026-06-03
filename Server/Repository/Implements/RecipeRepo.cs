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
                .Include(r => r.RecipeLabels)
                .Include(r => r.SavedRecipes)
                .ToListAsync();
        }

        public async Task<Recipe?> GetRecipeById(Guid id)
        {
            return await _ctx.Recipes
                .Include(r => r.RecipeLabels)
                .Include(r => r.SavedRecipes)
                .FirstOrDefaultAsync(r => r.Recipe_id == id);
        }

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

        public async Task<Recipe> DeleteRecipe(Guid id)
        {
            var recipe = await _ctx.Recipes.FindAsync(id);
            if (recipe == null)
                throw new Exception("Recipe not found");
                
            _ctx.Recipes.Remove(recipe);
            await _ctx.SaveChangesAsync();
            return recipe;
        }
    }
}
