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
    public class RecipeTagRepo : IRecipeTagRepo
    {
        private readonly AppDbContext _ctx;
        public RecipeTagRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<RecipeTag>> GetAllRecipeTags()
        {
            return await _ctx.RecipeTags
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<RecipeTag?> GetRecipeTagById(Guid id)
            => await _ctx.RecipeTags
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Rt_Id == id);

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

        public async Task<RecipeTag> SoftDeleteRecipeTag(Guid id)
        {
            var recipeTag = _ctx.RecipeTags.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Rt_Id == id);
            if (recipeTag == null)
                throw new Exception("RecipeTag not found");
            recipeTag.IsDeleted = true;
            _ctx.RecipeTags.Update(recipeTag);
            await _ctx.SaveChangesAsync();
            return recipeTag;
        }
    }
}
