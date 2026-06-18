using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface IUserDietPlanService
    {
        Task<List<UserDietPlan>> GetAllUserDietPlans();

        Task<UserDietPlan> GetUserDietPlanById(Guid id);

        Task<UserDietPlan> CreateUserDietPlan(UserDietPlanRequest request);

        Task<UserDietPlan> UpdateUserDietPlan(Guid id, UserDietPlanRequest request);

        Task<UserDietPlan> SoftDeleteUserDietPlan(Guid id);
    }
}
