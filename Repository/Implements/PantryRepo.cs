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
                .Include(p => p.Account)
                .Include(p => p.Ingredient)
        
                .ToListAsync();
        }

        public async Task<Pantry?> GetPantryById(Guid id)
            => await _ctx.Pantries
                .Include(p => p.Account)
                .Include(p => p.Ingredient)
       
                .FirstOrDefaultAsync(p => p.Pantry_id == id);

        public async Task<List<Pantry>> GetPantriesByAccountId(Guid accountId)
            => await _ctx.Pantries
                .Include(p => p.Account)
                .Include(p => p.Ingredient)
            
                .ToListAsync();

        public async Task<List<Pantry>> GetPantriesByIngredientId(Guid ingredientId)
            => await _ctx.Pantries
                .Include(p => p.Account)
                .Include(p => p.Ingredient)
          
                .ToListAsync();

        public async Task<Pantry?> GetPantryByAccountAndIngredient(Guid accountId, Guid ingredientId)
            => await _ctx.Pantries
                .Include(p => p.Account)
                .Include(p => p.Ingredient)
                .Where(p => p.Account_id == accountId && p.Ingredient_id == ingredientId)
                .FirstOrDefaultAsync();

        public async Task<List<Pantry>> GetExpiringPantries(Guid accountId, DateTime thresholdDate)
            => await _ctx.Pantries
                .Include(p => p.Account)
                .Include(p => p.Ingredient)
                .Where(p => p.Account_id == accountId && p.ExpiryDate <= thresholdDate)
                .ToListAsync();

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

        public async Task<Pantry> HotDeletePantry(Guid id)
        {
            var existingPantry = await _ctx.Pantries
                .Where(p => p.Pantry_id == id)
                .FirstOrDefaultAsync();
            if (existingPantry == null)
                throw new KeyNotFoundException($"Pantry with id {id} not found");
           
            _ctx.Pantries.Remove(existingPantry);
            await _ctx.SaveChangesAsync();
            return existingPantry;
        }
    }
}
