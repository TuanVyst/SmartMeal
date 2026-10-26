using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class PantryRepo : IPantryRepo
    {
        private readonly AppDbContext _ctx;
        private static readonly ConcurrentDictionary<Guid, (List<Pantry> Items, DateTime Expiry)> _cache = new();

        public PantryRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public static void InvalidateCache(Guid? accountId = null)
        {
            if (accountId.HasValue)
                _cache.TryRemove(accountId.Value, out _);
            else
                _cache.Clear();
        }

        public async Task<List<Pantry>> GetAllPantries()
        {
            return await _ctx.Pantries
                .AsNoTracking()
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
            if (_cache.TryGetValue(accountId, out var entry) && DateTime.UtcNow < entry.Expiry)
            {
                return entry.Items;
            }

            var list = await _ctx.Pantries
                .AsNoTracking()
                .Where(p => p.Account_id == accountId)
                .ToListAsync();

            _cache[accountId] = (list, DateTime.UtcNow.AddMinutes(5));
            return list;
        }

        public async Task<Pantry> CreatePantry(Pantry pantry)
        {
            _ctx.Pantries.Add(pantry);
            await _ctx.SaveChangesAsync();
            InvalidateCache(pantry.Account_id);
            return pantry;
        }

        public async Task<Pantry> UpdatePantry(Pantry pantry)
        {
            _ctx.Pantries.Update(pantry);
            await _ctx.SaveChangesAsync();
            InvalidateCache(pantry.Account_id);
            return pantry;
        }

        public async Task<Pantry> HardDeletePantry(Guid id)
        {
            var pantry = await _ctx.Pantries.FirstOrDefaultAsync(i => i.Pantry_id == id);
            if (pantry == null)
                throw new Exception("Pantry not found");
            
            _ctx.Pantries.Remove(pantry);
            await _ctx.SaveChangesAsync();
            InvalidateCache(pantry.Account_id);
            return pantry;
        }
    }
}
