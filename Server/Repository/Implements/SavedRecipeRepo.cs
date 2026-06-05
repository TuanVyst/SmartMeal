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
    public class SavedRecipeRepo : ISavedRecipeRepo
    {
        private readonly AppDbContext _ctx;
        public SavedRecipeRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<SavedRecipe>> GetAllSavedRecipes()
        {
            return await _ctx.SavedRecipes
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<SavedRecipe?> GetSavedRecipeById(Guid id)
            => await _ctx.SavedRecipes
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Id == id);

        public async Task<SavedRecipe?> GetSavedRecipeByCollectionAndRecipe(Guid collectionId, Guid recipeId)
            => await _ctx.SavedRecipes
                .FirstOrDefaultAsync(i => i.Collection_Id == collectionId && i.Recipe_Id == recipeId);

        public async Task<List<SavedRecipe>> GetSavedRecipesByCollectionId(Guid collectionId)
            => await _ctx.SavedRecipes
                .Include(i => i.Recipe)
                .Where(i => !i.IsDeleted && i.Collection_Id == collectionId)
                .ToListAsync();

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

        public async Task<SavedRecipe> SoftDeleteSavedRecipe(Guid id)
        {
            var savedRecipe = _ctx.SavedRecipes.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Id == id);
            if (savedRecipe == null)
                throw new Exception("SavedRecipe not found");
            savedRecipe.IsDeleted = true;
            _ctx.SavedRecipes.Update(savedRecipe);
            await _ctx.SaveChangesAsync();
            return savedRecipe;
        }
    }
}
