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
    public class AllergyRepo : IAllergyRepo
    {
        private readonly AppDbContext _ctx;
        public AllergyRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Allergy>> GetAllAllergies()
        {
            return await _ctx.Allergies
                .Include(a => a.Account)
                .Include(a => a.Ingredient)
                .Where(a => a.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Allergy?> GetAllergyById(Guid id)
            => await _ctx.Allergies
                .Include(a => a.Account)
                .Include(a => a.Ingredient)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Allergy_id == id);

        public async Task<List<Allergy>> GetAllergiesByAccountId(Guid accountId)
            => await _ctx.Allergies
                .Include(a => a.Account)
                .Include(a => a.Ingredient)
                .Where(a => a.Account_id == accountId && a.IsDeleted == false)
                .ToListAsync();

        public async Task<Allergy?> GetAllergyByAccountAndIngredient(Guid accountId, Guid ingredientId)
            => await _ctx.Allergies
                .Include(a => a.Account)
                .Include(a => a.Ingredient)
                .Where(a => a.Account_id == accountId && a.Ingredient_id == ingredientId && a.IsDeleted == false)
                .FirstOrDefaultAsync();

        public async Task<Allergy> CreateAllergy(Allergy allergy)
        {
            _ctx.Allergies.Add(allergy);
            await _ctx.SaveChangesAsync();
            return allergy;
        }

        public async Task<Allergy> UpdateAllergy(Allergy allergy)
        {
            _ctx.Allergies.Update(allergy);
            await _ctx.SaveChangesAsync();
            return allergy;
        }

        public async Task<Allergy> SoftDeleteAllergy(Guid id)
        {
            var existingAllergy = await _ctx.Allergies
                .Where(a => a.IsDeleted == false && a.Allergy_id == id)
                .FirstOrDefaultAsync();
            if (existingAllergy == null)
                throw new KeyNotFoundException($"Allergy with id {id} not found");
            existingAllergy.IsDeleted = true;
            _ctx.Allergies.Update(existingAllergy);
            await _ctx.SaveChangesAsync();
            return existingAllergy;
        }
    }
}
