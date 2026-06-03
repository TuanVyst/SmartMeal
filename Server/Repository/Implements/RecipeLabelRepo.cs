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
    public class RecipeLabelRepo : IRecipeLabelRepo
    {
        private readonly AppDbContext _ctx;
        public RecipeLabelRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<RecipeLabel>> GetAllRecipeLabels()
        {
            return await _ctx.RecipeLabels
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<RecipeLabel?> GetRecipeLabelById(Guid id)
            => await _ctx.RecipeLabels
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Id == id);

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

        public async Task<RecipeLabel> SoftDeleteRecipeLabel(Guid id)
        {
            var recipeLabel = _ctx.RecipeLabels.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Id == id);
            if (recipeLabel == null)
                throw new Exception("RecipeLabel not found");
            recipeLabel.IsDeleted = true;
            _ctx.RecipeLabels.Update(recipeLabel);
            await _ctx.SaveChangesAsync();
            return recipeLabel;
        }
    }
}
