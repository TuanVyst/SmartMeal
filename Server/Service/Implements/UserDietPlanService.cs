using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class UserDietPlanService : IUserDietPlanService
    {
        private readonly IUserDietPlanRepo _userDietPlanRepo;

        public UserDietPlanService(IUserDietPlanRepo userDietPlanRepo)
        {
            _userDietPlanRepo = userDietPlanRepo;
        }

        public async Task<List<UserDietPlan>> GetAllUserDietPlans()
        {
            return await _userDietPlanRepo.GetAllUserDietPlans();
        }

        public async Task<UserDietPlan> GetUserDietPlanById(Guid id)
        {
            return await _userDietPlanRepo.GetUserDietPlanById(id);
        }

        public async Task<UserDietPlan> CreateUserDietPlan(UserDietPlanRequest request)
        {
            var entity = new UserDietPlan
            {
                UDP_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                Diet_id = request.Diet_id,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsActive = request.IsActive,
                IsDeleted = false
            };

            return await _userDietPlanRepo.CreateUserDietPlan(entity);
        }

        public async Task<UserDietPlan> UpdateUserDietPlan(Guid id, UserDietPlanRequest request)
        {
            var entity = await _userDietPlanRepo.GetUserDietPlanById(id);

            if (entity == null)
                throw new Exception("UserDietPlan not found");

            entity.Account_id = request.Account_id;
            entity.Diet_id = request.Diet_id;
            entity.StartDate = request.StartDate;
            entity.EndDate = request.EndDate;
            entity.IsActive = request.IsActive;

            return await _userDietPlanRepo.UpdateUserDietPlan(entity);
        }

        public async Task<UserDietPlan> SoftDeleteUserDietPlan(Guid id)
        {
            return await _userDietPlanRepo.SoftDeleteUserDietPlan(id);
        }
    }
}
