using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class UserConditionRepo : IUserConditionRepo
    {
        private readonly AppDbContext _ctx;

        public UserConditionRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<UserCondition>> GetAllUserConditions()
        {
            return await _ctx.UserConditions
                .Where(x => x.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<UserCondition?> GetUserConditionById(Guid id)
        {
            return await _ctx.UserConditions
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.UC_id == id);
        }

        public async Task<UserCondition> CreateUserCondition(UserCondition userCondition)
        {
            _ctx.UserConditions.Add(userCondition);
            await _ctx.SaveChangesAsync();

            return userCondition;
        }

        public async Task<UserCondition> UpdateUserCondition(UserCondition userCondition)
        {
            _ctx.UserConditions.Update(userCondition);
            await _ctx.SaveChangesAsync();

            return userCondition;
        }

        public async Task<UserCondition> SoftDeleteUserCondition(Guid id)
        {
            var userCondition = await _ctx.UserConditions
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.UC_id == id);

            if (userCondition == null)
                throw new Exception("UserCondition not found");

            userCondition.IsDeleted = true;

            _ctx.UserConditions.Update(userCondition);
            await _ctx.SaveChangesAsync();

            return userCondition;
        }
    }
}