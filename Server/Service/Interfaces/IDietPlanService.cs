using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface IDietPlanService
    {
        Task<List<DietPlan>> GetAllDietPlans();

        Task<DietPlan> GetDietPlanById(Guid id);

        Task<DietPlan> CreateDietPlan(DietPlanRequest request);

        Task<DietPlan> UpdateDietPlan(Guid id, DietPlanRequest request);

        Task<DietPlan> SoftDeleteDietPlan(Guid id);
    }
}