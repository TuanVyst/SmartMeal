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

        public async Task<List<Allergy>> GetAllAllergies(CancellationToken cancellationToken = default)
        {
            return await _ctx.Allergies
                .AsNoTracking()
                .Where(i => i.IsDeleted == false)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Allergy>> GetAllergiesByAccountId(Guid accountId, CancellationToken cancellationToken = default)
        {
            return await _ctx.Allergies
                .AsNoTracking()
                .Where(i => i.IsDeleted == false && i.Account_id == accountId)
                .ToListAsync(cancellationToken);
        }

        public async Task<Allergy?> GetAllergyById(Guid id, CancellationToken cancellationToken = default)
            => await _ctx.Allergies
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Allergy_id == id, cancellationToken);

        public async Task<Allergy?> GetAllergyByAccountAndIngredient(Guid accountId, Guid ingredientId, CancellationToken cancellationToken = default)
            => await _ctx.Allergies
                .FirstOrDefaultAsync(i => i.Account_id == accountId && i.Ingredient_id == ingredientId, cancellationToken);

        public async Task<Allergy> CreateAllergy(Allergy allergy, CancellationToken cancellationToken = default)
        {
            _ctx.Allergies.Add(allergy);
            await _ctx.SaveChangesAsync(cancellationToken);
            return allergy;
        }

        public async Task<Allergy> UpdateAllergy(Allergy allergy, CancellationToken cancellationToken = default)
        {
            _ctx.Allergies.Update(allergy);
            await _ctx.SaveChangesAsync(cancellationToken);
            return allergy;
        }

        public async Task<Allergy> SoftDeleteAllergy(Guid id, CancellationToken cancellationToken = default)
        {
            var allergy = await _ctx.Allergies
                .FirstOrDefaultAsync(i => i.Allergy_id == id && i.IsDeleted == false, cancellationToken);
            if (allergy == null)
                throw new KeyNotFoundException("Allergy not found");
            allergy.IsDeleted = true;
            _ctx.Allergies.Update(allergy);
            await _ctx.SaveChangesAsync(cancellationToken);
            return allergy;
        }
    }
}
