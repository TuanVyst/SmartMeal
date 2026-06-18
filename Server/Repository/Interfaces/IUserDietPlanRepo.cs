using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IUserDietPlanRepo
    {
        Task<List<UserDietPlan>> GetAllUserDietPlans();

        Task<UserDietPlan?> GetUserDietPlanById(Guid id);

        Task<UserDietPlan> CreateUserDietPlan(UserDietPlan userDietPlan);

        Task<UserDietPlan> UpdateUserDietPlan(UserDietPlan userDietPlan);

        Task<UserDietPlan> SoftDeleteUserDietPlan(Guid id);
    }
}
