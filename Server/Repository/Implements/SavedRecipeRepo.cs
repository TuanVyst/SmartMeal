using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class SavedRecipeRepo : ISavedRecipeRepo
    {
        private readonly AppDbContext _ctx;
        
        public SavedRecipeRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<SavedRecipe>> GetAllSavedRecipes()
        {
            return await _ctx.SavedRecipes.ToListAsync();
        }

        public async Task<SavedRecipe?> GetSavedRecipeById(Guid id)
        {
            return await _ctx.SavedRecipes.FindAsync(id);
        }

        public async Task<SavedRecipe> CreateSavedRecipe(SavedRecipe savedRecipe)
        {
            _ctx.SavedRecipes.Add(savedRecipe);
            await _ctx.SaveChangesAsync();
            return savedRecipe;
        }

        public async Task<SavedRecipe> UpdateSavedRecipe(SavedRecipe savedRecipe)
        {
            _ctx.SavedRecipes.Update(savedRecipe);
            await _ctx.SaveChangesAsync();
            return savedRecipe;
        }

        public async Task<SavedRecipe> DeleteSavedRecipe(Guid id)
        {
            var savedRecipe = await _ctx.SavedRecipes.FindAsync(id);
            if (savedRecipe == null)
                throw new Exception("SavedRecipe not found");
                
            _ctx.SavedRecipes.Remove(savedRecipe);
            await _ctx.SaveChangesAsync();
            return savedRecipe;
        }
    }
}
