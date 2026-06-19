using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface INutritionLogService
    {
        Task<List<NutritionLog>> GetAllNutritionLogs();

        Task<NutritionLog> GetNutritionLogById(Guid id);

        Task<List<NutritionLog>> GetNutritionLogsByAccountAndDate(Guid accountId, DateTime date);

        Task<List<NutritionLog>> GetNutritionLogsByAccountAndDateRange(Guid accountId, DateTime startDate, DateTime endDate);

        Task<NutritionLog> CreateNutritionLog(NutritionLogRequest request);

        Task<NutritionLog> UpdateNutritionLog(Guid id, NutritionLogRequest request);

        Task<NutritionLog> SoftDeleteNutritionLog(Guid id);
    }
}
