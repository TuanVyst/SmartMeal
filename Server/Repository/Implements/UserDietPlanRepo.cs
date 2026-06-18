using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class UserDietPlanRepo : IUserDietPlanRepo
    {
        private readonly AppDbContext _ctx;

        public UserDietPlanRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<UserDietPlan>> GetAllUserDietPlans()
        {
            return await _ctx.UserDietPlans
                .Include(x => x.Account)
                .Include(x => x.DietPlan)
                .Where(x => x.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<UserDietPlan?> GetUserDietPlanById(Guid id)
        {
            return await _ctx.UserDietPlans
                .Include(x => x.Account)
                .Include(x => x.DietPlan)
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.UDP_id == id);
        }

        public async Task<UserDietPlan> CreateUserDietPlan(UserDietPlan userDietPlan)
        {
            _ctx.UserDietPlans.Add(userDietPlan);
            await _ctx.SaveChangesAsync();

            return userDietPlan;
        }

        public async Task<UserDietPlan> UpdateUserDietPlan(UserDietPlan userDietPlan)
        {
            _ctx.UserDietPlans.Update(userDietPlan);
            await _ctx.SaveChangesAsync();

            return userDietPlan;
        }

        public async Task<UserDietPlan> SoftDeleteUserDietPlan(Guid id)
        {
            var entity = await _ctx.UserDietPlans
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.UDP_id == id);

            if (entity == null)
                throw new Exception("UserDietPlan not found");

            entity.IsDeleted = true;

            _ctx.UserDietPlans.Update(entity);
            await _ctx.SaveChangesAsync();

            return entity;
        }
    }
}
