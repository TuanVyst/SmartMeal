using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
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
            return await _ctx.RecipeIngredients.ToListAsync();
        }

        public async Task<RecipeIngredient?> GetRecipeIngredientById(Guid id)
        {
            return await _ctx.RecipeIngredients.FindAsync(id);
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

        public async Task<RecipeIngredient> DeleteRecipeIngredient(Guid id)
        {
            var recipeIngredient = await _ctx.RecipeIngredients.FindAsync(id);
            if (recipeIngredient == null)
                throw new Exception("RecipeIngredient not found");
                
            _ctx.RecipeIngredients.Remove(recipeIngredient);
            await _ctx.SaveChangesAsync();
            return recipeIngredient;
        }
    }
}
