
using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class IngredientLabelRepo : IIngredientLabelRepo
    {
        private readonly AppDbContext _ctx;
        public IngredientLabelRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<IngredientLabel>> GetAllIngredientLabels()
        {
            return await _ctx.IngredientLabels
                .Include(i => i.Ingredient_tag)
                .Include(i => i.Ingredient)
                .Where(i => i.IsDeleted == false)
                .OrderBy(i => i.Ingredient_tag.Name)
                .ToListAsync();
        }

        public async Task<IngredientLabel?> GetIngredientLabelById(Guid id)
            => await _ctx.IngredientLabels
                .Include(i => i.Ingredient_tag)
                .Include(i => i.Ingredient)
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Id == id);

        public async Task<IngredientLabel> CreateIngredientLabel(IngredientLabel ingredientLabel)
        {
            _ctx.IngredientLabels.Add(ingredientLabel);
            await _ctx.SaveChangesAsync();
            return ingredientLabel;
        }

        public async Task<IngredientLabel> UpdateIngredientLabel(IngredientLabel ingredientLabel)
        {
            _ctx.IngredientLabels.Update(ingredientLabel);
            await _ctx.SaveChangesAsync();
            return ingredientLabel;
        }

        public async Task<IngredientLabel> SoftDeleteIngredientLabel(Guid id)
        {
            var ingredientLabel = _ctx.IngredientLabels.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Id == id);
            if (ingredientLabel == null)
                throw new Exception("IngredientLabel not found");
            ingredientLabel.IsDeleted = true;
            _ctx.IngredientLabels.Update(ingredientLabel);
            await _ctx.SaveChangesAsync();
            return ingredientLabel;
        }
    }
    
}