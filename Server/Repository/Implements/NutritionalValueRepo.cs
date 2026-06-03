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
    public class NutritionalValueRepo : INutritionalValueRepo
    {
        private readonly AppDbContext _ctx;
        public NutritionalValueRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<NutritionalValue>> GetAllNutritionalValues()
        {
            return await _ctx.NutritionalValues
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<NutritionalValue?> GetNutritionalValueById(Guid id)
            => await _ctx.NutritionalValues
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Nv_id == id);

        public async Task<NutritionalValue> CreateNutritionalValue(NutritionalValue nutritionalValue)
        {
            _ctx.NutritionalValues.Add(nutritionalValue);
            await _ctx.SaveChangesAsync();
            return nutritionalValue;
        }

        public async Task<NutritionalValue> UpdateNutritionalValue(NutritionalValue nutritionalValue)
        {
            _ctx.NutritionalValues.Update(nutritionalValue);
            await _ctx.SaveChangesAsync();
            return nutritionalValue;
        }

        public async Task<NutritionalValue> SoftDeleteNutritionalValue(Guid id)
        {
            var nutritionalValue = _ctx.NutritionalValues.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Nv_id == id);
            if (nutritionalValue == null)
                throw new Exception("NutritionalValue not found");
            nutritionalValue.IsDeleted = true;
            _ctx.NutritionalValues.Update(nutritionalValue);
            await _ctx.SaveChangesAsync();
            return nutritionalValue;
        }
    }
}
