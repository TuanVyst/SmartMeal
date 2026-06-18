using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface INutritionGoalService
    {
        Task<List<NutritionGoal>> GetAllNutritionGoals();

        Task<NutritionGoal> GetNutritionGoalById(Guid id);

        Task<NutritionGoal> CreateNutritionGoal(NutritionGoalRequest request);

        Task<NutritionGoal> UpdateNutritionGoal(Guid id, NutritionGoalRequest request);

        Task<NutritionGoal> SoftDeleteNutritionGoal(Guid id);
    }
}
