using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface INutritionLogRepo
    {
        Task<List<NutritionLog>> GetAllNutritionLogs();

        Task<NutritionLog?> GetNutritionLogById(Guid id);

        Task<List<NutritionLog>> GetNutritionLogsByAccountAndDate(Guid accountId, DateTime date);

        Task<List<NutritionLog>> GetNutritionLogsByAccountAndDateRange(Guid accountId, DateTime startDate, DateTime endDate);

        Task<NutritionLog> CreateNutritionLog(NutritionLog nutritionLog);

        Task<NutritionLog> UpdateNutritionLog(NutritionLog nutritionLog);

        Task<NutritionLog> SoftDeleteNutritionLog(Guid id);
    }
}
