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
                .AsSplitQuery()
                .Include(mp => mp.Days.Where(d => !d.IsDeleted))
                    .ThenInclude(d => d.Entries.Where(e => !e.IsDeleted))
                        .ThenInclude(e => e.Recipe)
                            .ThenInclude(r => r.RecipeIngredients.Where(ri => !ri.IsDeleted))
                                .ThenInclude(ri => ri.Ingredient)
                .Where(mp => mp.Account_id == accountId && mp.Status == "active" && !mp.IsDeleted)
                .OrderByDescending(mp => mp.GeneratedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<MealPlan> GetActivePlanLightByAccountId(Guid accountId)
        {
            return await _context.MealPlans
                .AsSplitQuery()
                .Include(mp => mp.Days.Where(d => !d.IsDeleted))
                    .ThenInclude(d => d.Entries.Where(e => !e.IsDeleted))
                .Where(mp => mp.Account_id == accountId && mp.Status == "active" && !mp.IsDeleted)
                .OrderByDescending(mp => mp.GeneratedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<MealPlan> GetPlanById(Guid planId)
        {
            return await _context.MealPlans
                .AsSplitQuery()
                .Include(mp => mp.Days.Where(d => !d.IsDeleted))
                    .ThenInclude(d => d.Entries.Where(e => !e.IsDeleted))
                        .ThenInclude(e => e.Recipe)
                            .ThenInclude(r => r.RecipeIngredients.Where(ri => !ri.IsDeleted))
                                .ThenInclude(ri => ri.Ingredient)
                .FirstOrDefaultAsync(mp => mp.MealPlan_id == planId && !mp.IsDeleted);
        }

        public async Task<List<MealPlan>> GetAllPlansByAccountId(Guid accountId)
        {
            return await _context.MealPlans
                .AsNoTracking()
                .AsSplitQuery()
                .Include(mp => mp.Days.Where(d => !d.IsDeleted))
                    .ThenInclude(d => d.Entries.Where(e => !e.IsDeleted))
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
            await _context.SaveChangesAsync();
        }

        public async Task RemoveEntry(MealPlanEntry entry)
        {
            _context.MealPlanEntries.Remove(entry);
            await _context.SaveChangesAsync();
        }

        public async Task AddEntry(MealPlanEntry entry)
        {
            await _context.MealPlanEntries.AddAsync(entry);
        }

        public async Task<List<MealPlanDay>> GetDaysByDateRange(Guid accountId, DateTime startDate, DateTime endDate)
        {
            var startOnly = startDate.Date;
            var endOnly = endDate.Date;
            return await _context.MealPlanDays
                .AsNoTracking()
                .AsSplitQuery()
                .Include(d => d.Entries.Where(e => !e.IsDeleted))
                .Where(d => !d.IsDeleted
                         && !d.MealPlan.IsDeleted
                         && d.MealPlan.Status == "active"
                         && d.MealPlan.Account_id == accountId
                         && d.DayDate.Date >= startOnly
                         && d.DayDate.Date <= endOnly)
                .OrderBy(d => d.DayDate)
                .ToListAsync();
        }

        public async Task SaveEntryDirectly(MealPlanEntry entry)
        {
            await _context.MealPlanEntries.AddAsync(entry);
            await _context.SaveChangesAsync();
        }

        public async Task AddDay(MealPlanDay day)
        {
            await _context.MealPlanDays.AddAsync(day);
            await _context.SaveChangesAsync();
        }

        public async Task SaveBatchAsync(List<MealPlanDay> newDays, List<MealPlanEntry> newEntries)
        {
            if (newDays != null && newDays.Count > 0)
            {
                await _context.MealPlanDays.AddRangeAsync(newDays);
            }
            if (newEntries != null && newEntries.Count > 0)
            {
                await _context.MealPlanEntries.AddRangeAsync(newEntries);
            }
            await _context.SaveChangesAsync();
        }
    }
}
