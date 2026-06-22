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
    public class RecipeIngredientRepo : IRecipeIngredientRepo
    {
        private readonly AppDbContext _ctx;
        public RecipeIngredientRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<RecipeIngredient>> GetAllRecipeIngredients()
        {
            return await _ctx.RecipeIngredients
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<RecipeIngredient?> GetRecipeIngredientById(Guid id)
            => await _ctx.RecipeIngredients
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.RI_id == id);

        public async Task<List<RecipeIngredient>> GetRecipeIngredientsByRecipeId(Guid recipeId)
        {
            return await _ctx.RecipeIngredients
                .Include(ri => ri.Ingredient).ThenInclude(i => i.Nutritional_value)
                .Where(ri => ri.Recipe_id == recipeId && !ri.IsDeleted)
                .ToListAsync();
        }

        public async Task<RecipeIngredient> CreateRecipeIngredient(RecipeIngredient recipeIngredient)
        {
            _ctx.RecipeIngredients.Add(recipeIngredient);
            await _ctx.SaveChangesAsync();
            return recipeIngredient;
        }

        public async Task<RecipeIngredient> UpdateRecipeIngredient(RecipeIngredient recipeIngredient)
        {
            _ctx.RecipeIngredients.Update(recipeIngredient);
            await _ctx.SaveChangesAsync();
            return recipeIngredient;
        }

        public async Task<RecipeIngredient> SoftDeleteRecipeIngredient(Guid id)
        {
            var recipeIngredient = _ctx.RecipeIngredients.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.RI_id == id);
            if (recipeIngredient == null)
                throw new Exception("RecipeIngredient not found");
            recipeIngredient.IsDeleted = true;
            _ctx.RecipeIngredients.Update(recipeIngredient);
            await _ctx.SaveChangesAsync();
            return recipeIngredient;
        }
    }
}
