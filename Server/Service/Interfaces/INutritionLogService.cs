using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface INutritionLogService
    {
        Task<List<NutritionLog>> GetAllNutritionLogs();

        Task<NutritionLog> GetNutritionLogById(Guid id);

        Task<NutritionLog> CreateNutritionLog(NutritionLogRequest request);

        Task<NutritionLog> UpdateNutritionLog(Guid id, NutritionLogRequest request);

        Task<NutritionLog> SoftDeleteNutritionLog(Guid id);
    }
}
