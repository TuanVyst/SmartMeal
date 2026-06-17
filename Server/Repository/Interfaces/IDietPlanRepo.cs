using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IDietPlanRepo
    {
        Task<List<DietPlan>> GetAllDietPlans();

        Task<DietPlan?> GetDietPlanById(Guid id);

        Task<DietPlan> CreateDietPlan(DietPlan dietPlan);

        Task<DietPlan> UpdateDietPlan(DietPlan dietPlan);

        Task<DietPlan> SoftDeleteDietPlan(Guid id);
    }
}