using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class NutritionLogService : INutritionLogService
    {
        private readonly INutritionLogRepo _nutritionLogRepo;

        public NutritionLogService(INutritionLogRepo nutritionLogRepo)
        {
            _nutritionLogRepo = nutritionLogRepo;
        }

        public async Task<List<NutritionLog>> GetAllNutritionLogs()
        {
            return await _nutritionLogRepo.GetAllNutritionLogs();
        }

        public async Task<NutritionLog> GetNutritionLogById(Guid id)
        {
            return await _nutritionLogRepo.GetNutritionLogById(id);
        }

        public async Task<NutritionLog> CreateNutritionLog(NutritionLogRequest request)
        {
            var entity = new NutritionLog
            {
                Log_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                LogDate = request.LogDate == default ? DateTime.UtcNow : request.LogDate,
                MealType = request.MealType,
                Recipe_id = request.Recipe_id,
                Ingredient_id = request.Ingredient_id,
                Quantity = request.Quantity,
                Unit = request.Unit,
                TotalCalories = request.TotalCalories,
                TotalProtein = request.TotalProtein,
                TotalCarbs = request.TotalCarbs,
                TotalFat = request.TotalFat,
                TotalFiber = request.TotalFiber,
                TotalSugar = request.TotalSugar,
                TotalSodium = request.TotalSodium,
                TotalCholesterol = request.TotalCholesterol,
                IsDeleted = false
            };

            return await _nutritionLogRepo.CreateNutritionLog(entity);
        }

        public async Task<NutritionLog> UpdateNutritionLog(Guid id, NutritionLogRequest request)
        {
            var entity = await _nutritionLogRepo.GetNutritionLogById(id);

            if (entity == null)
                throw new Exception("NutritionLog not found");

            entity.Account_id = request.Account_id;
            entity.LogDate = request.LogDate == default ? DateTime.UtcNow : request.LogDate;
            entity.MealType = request.MealType;
            entity.Recipe_id = request.Recipe_id;
            entity.Ingredient_id = request.Ingredient_id;
            entity.Quantity = request.Quantity;
            entity.Unit = request.Unit;
            entity.TotalCalories = request.TotalCalories;
            entity.TotalProtein = request.TotalProtein;
            entity.TotalCarbs = request.TotalCarbs;
            entity.TotalFat = request.TotalFat;
            entity.TotalFiber = request.TotalFiber;
            entity.TotalSugar = request.TotalSugar;
            entity.TotalSodium = request.TotalSodium;
            entity.TotalCholesterol = request.TotalCholesterol;

            return await _nutritionLogRepo.UpdateNutritionLog(entity);
        }

        public async Task<NutritionLog> SoftDeleteNutritionLog(Guid id)
        {
            return await _nutritionLogRepo.SoftDeleteNutritionLog(id);
        }
    }
}
