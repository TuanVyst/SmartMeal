using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class NutritionGoalRepo : INutritionGoalRepo
    {
        private readonly AppDbContext _ctx;

        public NutritionGoalRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<NutritionGoal>> GetAllNutritionGoals()
        {
            return await _ctx.NutritionGoals
                .Include(x => x.Account)
                .Where(x => x.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<NutritionGoal?> GetNutritionGoalById(Guid id)
        {
            return await _ctx.NutritionGoals
                .Include(x => x.Account)
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Goal_id == id);
        }

        public async Task<NutritionGoal?> GetNutritionGoalByAccountId(Guid accountId)
        {
            return await _ctx.NutritionGoals
                .Include(x => x.Account)
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Account_id == accountId);
        }

        public async Task<NutritionGoal> CreateNutritionGoal(NutritionGoal nutritionGoal)
        {
            _ctx.NutritionGoals.Add(nutritionGoal);
            await _ctx.SaveChangesAsync();

            return nutritionGoal;
        }

        public async Task<NutritionGoal> UpdateNutritionGoal(NutritionGoal nutritionGoal)
        {
            _ctx.NutritionGoals.Update(nutritionGoal);
            await _ctx.SaveChangesAsync();

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

            _ctx.NutritionGoals.Update(entity);
            await _ctx.SaveChangesAsync();

            return entity;
        }
    }
}
