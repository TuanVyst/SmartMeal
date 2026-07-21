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
    public class PantryRepo : IPantryRepo
    {
        private readonly AppDbContext _ctx;
        public PantryRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Pantry>> GetAllPantries()
        {
            return await _ctx.Pantries
                
                .ToListAsync();
        }

        public async Task<Pantry?> GetPantryById(Guid id)
        {
            return await _ctx.Pantries
                .Include(p => p.Ingredient)
                .Include(p => p.Account)
                .FirstOrDefaultAsync(p => p.Pantry_id == id);
        }

        public async Task<List<Pantry>> GetPantryByAccountId(Guid accountId)
        {
            return await _ctx.Pantries
                .Include(p => p.Ingredient)
                .Where(p => p.Account_id == accountId)
                .ToListAsync();
        }

        public async Task<Pantry> CreatePantry(Pantry pantry)
        {
            _ctx.Pantries.Add(pantry);
            await _ctx.SaveChangesAsync();
            return pantry;
        }

        public async Task<Pantry> UpdatePantry(Pantry pantry)
        {
            _ctx.Pantries.Update(pantry);
            await _ctx.SaveChangesAsync();
            return pantry;
        }

        public async Task<Pantry> HardDeletePantry(Guid id)
        {
            var pantry = _ctx.Pantries.FirstOrDefault(i => i.Pantry_id == id);
            if (pantry == null)
                throw new Exception("Pantry not found");
            
            _ctx.Pantries.Update(pantry);
            await _ctx.SaveChangesAsync();
            return pantry;
        }
    }
}
