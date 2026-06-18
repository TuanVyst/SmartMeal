using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class DietPlanRepo : IDietPlanRepo
    {
        private readonly AppDbContext _ctx;

        public DietPlanRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<DietPlan>> GetAllDietPlans()
        {
            return await _ctx.DietPlans
                .Where(x => x.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<DietPlan?> GetDietPlanById(Guid id)
        {
            return await _ctx.DietPlans
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Diet_id == id);
        }

        public async Task<DietPlan> CreateDietPlan(DietPlan dietPlan)
        {
            _ctx.DietPlans.Add(dietPlan);
            await _ctx.SaveChangesAsync();

            return dietPlan;
        }

        public async Task<DietPlan> UpdateDietPlan(DietPlan dietPlan)
        {
            _ctx.DietPlans.Update(dietPlan);
            await _ctx.SaveChangesAsync();

            return dietPlan;
        }

        public async Task<DietPlan> SoftDeleteDietPlan(Guid id)
        {
            var dietPlan = await _ctx.DietPlans
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Diet_id == id);

            if (dietPlan == null)
                throw new Exception("DietPlan not found");

            dietPlan.IsDeleted = true;

            _ctx.DietPlans.Update(dietPlan);
            await _ctx.SaveChangesAsync();

            return dietPlan;
        }
    }
}