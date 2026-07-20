using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface INutritionGoalRepo
    {
        Task<List<NutritionGoal>> GetAllNutritionGoals();

        Task<NutritionGoal?> GetNutritionGoalById(Guid id);
        Task<NutritionGoal?> GetNutritionGoalByAccountId(Guid accountId);

        Task<NutritionGoal> CreateNutritionGoal(NutritionGoal nutritionGoal);

        Task<NutritionGoal> UpdateNutritionGoal(NutritionGoal nutritionGoal);

        Task<NutritionGoal> SoftDeleteNutritionGoal(Guid id);
    }
}
