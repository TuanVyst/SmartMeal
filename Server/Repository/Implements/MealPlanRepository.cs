using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class MealPlanRepository : IMealPlanRepository
    {
        private readonly AppDbContext _context;

        public MealPlanRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MealPlan> GetActivePlanByAccountId(Guid accountId)
        {
            return await _context.MealPlans
                .Include(mp => mp.Days)
                    .ThenInclude(d => d.Entries)
                        .ThenInclude(e => e.Recipe)
                            .ThenInclude(r => r.RecipeIngredients)
                                .ThenInclude(ri => ri.Ingredient)
                .Include(mp => mp.Days)
                    .ThenInclude(d => d.Entries)
                        .ThenInclude(e => e.Recipe)
                            .ThenInclude(r => r.RecipeLabels)
                                .ThenInclude(rl => rl.RecipeTag)
                .Where(mp => mp.Account_id == accountId && mp.Status == "active" && !mp.IsDeleted)
                .OrderByDescending(mp => mp.GeneratedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<MealPlan> GetPlanById(Guid planId)
        {
            return await _context.MealPlans
                .Include(mp => mp.Days)
                    .ThenInclude(d => d.Entries)
                        .ThenInclude(e => e.Recipe)
                            .ThenInclude(r => r.RecipeIngredients)
                                .ThenInclude(ri => ri.Ingredient)
                .Include(mp => mp.Days)
                    .ThenInclude(d => d.Entries)
                        .ThenInclude(e => e.Recipe)
                            .ThenInclude(r => r.RecipeLabels)
                                .ThenInclude(rl => rl.RecipeTag)
                .FirstOrDefaultAsync(mp => mp.MealPlan_id == planId && !mp.IsDeleted);
        }

        public async Task<List<MealPlan>> GetAllPlansByAccountId(Guid accountId)
        {
            return await _context.MealPlans
                .Include(mp => mp.Days)
                    .ThenInclude(d => d.Entries)
                        .ThenInclude(e => e.Recipe)
                .Where(mp => mp.Account_id == accountId && mp.Status == "active" && !mp.IsDeleted)
                .OrderByDescending(mp => mp.GeneratedAt)
                .ToListAsync();
        }

        public async Task<MealPlan> AddPlan(MealPlan plan)
        {
            await _context.MealPlans.AddAsync(plan);
            await _context.SaveChangesAsync();
            return plan;
        }

        public async Task UpdatePlan(MealPlan plan)
        {
            _context.MealPlans.Update(plan);
            await _context.SaveChangesAsync();
        }

        public async Task<MealPlanEntry> GetEntryById(Guid entryId)
        {
            return await _context.MealPlanEntries
                .Include(e => e.MealPlanDay)
                .FirstOrDefaultAsync(e => e.Entry_id == entryId && !e.IsDeleted);
        }

        public async Task UpdateEntry(MealPlanEntry entry)
        {
            _context.MealPlanEntries.Update(entry);
            await _context.SaveChangesAsync();
        }
    }
}
