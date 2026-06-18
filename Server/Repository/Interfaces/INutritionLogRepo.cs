using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface INutritionLogRepo
    {
        Task<List<NutritionLog>> GetAllNutritionLogs();

        Task<NutritionLog?> GetNutritionLogById(Guid id);

        Task<NutritionLog> CreateNutritionLog(NutritionLog nutritionLog);

        Task<NutritionLog> UpdateNutritionLog(NutritionLog nutritionLog);

        Task<NutritionLog> SoftDeleteNutritionLog(Guid id);
    }
}
