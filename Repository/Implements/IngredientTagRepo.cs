using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class IngredientTagRepo : IIngredientTagRepo
    {
        private readonly AppDbContext _ctx;
        public IngredientTagRepo(AppDbContext context)
        {
            _ctx = context;
        }
        public async Task<List<IngredientTag>> GetAllIngredientTags()
        {
            return await _ctx.IngredientTags
                .Include(i => i.IngredientLabels)
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<IngredientTag?> GetIngredientTagById(Guid id)
            => await _ctx.IngredientTags
                .Include(i => i.IngredientLabels)
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.It_id == id);

        public async Task<IngredientTag> CreateIngredientTag(IngredientTag ingredientTag)
        {
            _ctx.IngredientTags.Add(ingredientTag);
            await _ctx.SaveChangesAsync();
            return ingredientTag;
        }

        public async Task<IngredientTag> UpdateIngredientTag(IngredientTag ingredientTag)
        {
            _ctx.IngredientTags.Update(ingredientTag);
            await _ctx.SaveChangesAsync();
            return ingredientTag;
        }

        public async Task<IngredientTag> SoftDeleteIngredientTag(Guid id)
        {
            var ingredientTag = _ctx.IngredientTags.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.It_id == id);
            if(ingredientTag == null)
                throw new Exception("IngredientTag not found");
            ingredientTag.IsDeleted = true;
            _ctx.IngredientTags.Update(ingredientTag);
            await _ctx.SaveChangesAsync();
            return ingredientTag;
        }

    }
}
