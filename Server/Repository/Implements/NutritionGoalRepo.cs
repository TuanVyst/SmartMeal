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
    public class NutritionGoalRepo : INutritionGoalRepo
    {
        private readonly AppDbContext _ctx;
        private static readonly ConcurrentDictionary<Guid, (NutritionGoal Goal, DateTime Expiry)> _cache = new();

        public NutritionGoalRepo(AppDbContext context)
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

        public async Task<List<NutritionGoal>> GetAllNutritionGoals()
        {
            return await _ctx.NutritionGoals
                .AsNoTracking()
                .Where(x => x.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<NutritionGoal?> GetNutritionGoalById(Guid id)
        {
            return await _ctx.NutritionGoals
                .AsNoTracking()
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Goal_id == id);
        }

        public async Task<NutritionGoal?> GetNutritionGoalByAccountId(Guid accountId)
        {
            if (_cache.TryGetValue(accountId, out var entry) && DateTime.UtcNow < entry.Expiry)
            {
                return entry.Goal;
            }

            var goal = await _ctx.NutritionGoals
                .AsNoTracking()
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Account_id == accountId);

            if (goal != null)
            {
                _cache[accountId] = (goal, DateTime.UtcNow.AddMinutes(5));
            }
            return goal;
        }

        public async Task<NutritionGoal> CreateNutritionGoal(NutritionGoal nutritionGoal)
        {
            _ctx.NutritionGoals.Add(nutritionGoal);
            await _ctx.SaveChangesAsync();
            _cache[nutritionGoal.Account_id] = (nutritionGoal, DateTime.UtcNow.AddMinutes(5));
            return nutritionGoal;
        }

        public async Task<NutritionGoal> UpdateNutritionGoal(NutritionGoal nutritionGoal)
        {
            _ctx.NutritionGoals.Update(nutritionGoal);
            await _ctx.SaveChangesAsync();
            _cache[nutritionGoal.Account_id] = (nutritionGoal, DateTime.UtcNow.AddMinutes(5));
            return nutritionGoal;
        }

        public async Task<NutritionGoal> SoftDeleteNutritionGoal(Guid id)
        {
            var entity = await _ctx.NutritionGoals
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Goal_id == id);

            if (entity == null)
                throw new Exception("NutritionGoal not found");

            entity.IsDeleted = true;
            await _ctx.SaveChangesAsync();
            InvalidateCache(entity.Account_id);
            return entity;
        }
    }
}
