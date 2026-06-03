using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class RecipeTagRepo : IRecipeTagRepo
    {
        private readonly AppDbContext _ctx;
        
        public RecipeTagRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<RecipeTag>> GetAllRecipeTags()
        {
            return await _ctx.RecipeTags.ToListAsync();
        }

        public async Task<RecipeTag?> GetRecipeTagById(Guid id)
        {
            return await _ctx.RecipeTags.FindAsync(id);
        }

        public async Task<RecipeTag> CreateRecipeTag(RecipeTag recipeTag)
        {
            _ctx.RecipeTags.Add(recipeTag);
            await _ctx.SaveChangesAsync();
            return recipeTag;
        }

        public async Task<RecipeTag> UpdateRecipeTag(RecipeTag recipeTag)
        {
            _ctx.RecipeTags.Update(recipeTag);
            await _ctx.SaveChangesAsync();
            return recipeTag;
        }

        public async Task<RecipeTag> DeleteRecipeTag(Guid id)
        {
            var recipeTag = await _ctx.RecipeTags.FindAsync(id);
            if (recipeTag == null)
                throw new Exception("RecipeTag not found");
                
            _ctx.RecipeTags.Remove(recipeTag);
            await _ctx.SaveChangesAsync();
            return recipeTag;
        }
    }
}
