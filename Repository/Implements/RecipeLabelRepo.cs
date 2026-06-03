using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class RecipeLabelRepo : IRecipeLabelRepo
    {
        private readonly AppDbContext _ctx;
        
        public RecipeLabelRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<RecipeLabel>> GetAllRecipeLabels()
        {
            return await _ctx.RecipeLabels.ToListAsync();
        }

        public async Task<RecipeLabel?> GetRecipeLabelById(Guid id)
        {
            return await _ctx.RecipeLabels.FindAsync(id);
        }

        public async Task<RecipeLabel> CreateRecipeLabel(RecipeLabel recipeLabel)
        {
            _ctx.RecipeLabels.Add(recipeLabel);
            await _ctx.SaveChangesAsync();
            return recipeLabel;
        }

        public async Task<RecipeLabel> UpdateRecipeLabel(RecipeLabel recipeLabel)
        {
            _ctx.RecipeLabels.Update(recipeLabel);
            await _ctx.SaveChangesAsync();
            return recipeLabel;
        }

        public async Task<RecipeLabel> DeleteRecipeLabel(Guid id)
        {
            var recipeLabel = await _ctx.RecipeLabels.FindAsync(id);
            if (recipeLabel == null)
                throw new Exception("RecipeLabel not found");
                
            _ctx.RecipeLabels.Remove(recipeLabel);
            await _ctx.SaveChangesAsync();
            return recipeLabel;
        }
    }
}
