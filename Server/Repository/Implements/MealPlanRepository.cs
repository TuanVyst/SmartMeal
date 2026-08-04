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
            foreach (var entry in _context.ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
                {
                    Console.WriteLine($"[DEBUG EF] Entity: {entry.Entity.GetType().Name}, State: {entry.State}");
                }
            }
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
            // Don't call SaveChangesAsync here because MealPlanningService handles it
        }

        public async Task<List<MealPlanDay>> GetDaysByDateRange(Guid accountId, DateTime startDate, DateTime endDate)
        {
            var startOnly = startDate.Date;
            var endOnly = endDate.Date;
            return await _context.MealPlanDays
                .Include(d => d.MealPlan)
                .Include(d => d.Entries)
                    .ThenInclude(e => e.Recipe)
                        .ThenInclude(r => r.RecipeIngredients)
                            .ThenInclude(ri => ri.Ingredient)
                .Include(d => d.Entries)
                    .ThenInclude(e => e.Recipe)
                        .ThenInclude(r => r.RecipeLabels)
                            .ThenInclude(rl => rl.RecipeTag)
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
    }
}
