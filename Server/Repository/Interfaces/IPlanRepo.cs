using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IPlanRepo
    {
        Task<List<Plan>> GetAllPlans();
        Task<Plan?> GetPlanById(Guid id);
        Task<Plan> CreatePlan(Plan plan);
        Task<Plan> UpdatePlan(Plan plan);
        Task<Plan> SoftDeletePlan(Guid id);
    }
}
