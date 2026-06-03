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
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Allergy?> GetAllergyById(Guid id)
            => await _ctx.Allergies
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Allergy_id == id);

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
            var allergy = _ctx.Allergies.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Allergy_id == id);
            if (allergy == null)
                throw new Exception("Allergy not found");
            allergy.IsDeleted = true;
            _ctx.Allergies.Update(allergy);
            await _ctx.SaveChangesAsync();
            return allergy;
        }
    }
}
