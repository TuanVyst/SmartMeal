using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class NutritionGoalService : INutritionGoalService
    {
        private readonly INutritionGoalRepo _nutritionGoalRepo;

        public NutritionGoalService(INutritionGoalRepo nutritionGoalRepo)
        {
            _nutritionGoalRepo = nutritionGoalRepo;
        }

        public async Task<List<NutritionGoal>> GetAllNutritionGoals()
        {
            return await _nutritionGoalRepo.GetAllNutritionGoals();
        }

        public async Task<NutritionGoal> GetNutritionGoalById(Guid id)
        {
            return await _nutritionGoalRepo.GetNutritionGoalById(id);
        }

        public async Task<NutritionGoal> CreateNutritionGoal(NutritionGoalRequest request)
        {
            var entity = new NutritionGoal
            {
                Goal_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                TargetCalories = request.TargetCalories,
                TargetProtein = request.TargetProtein,
                TargetCarbs = request.TargetCarbs,
                TargetFat = request.TargetFat,
                TargetFiber = request.TargetFiber,
                TargetSugar = request.TargetSugar,
                TargetSalt = request.TargetSalt,
                TargetCholesterol = request.TargetCholesterol,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            return await _nutritionGoalRepo.CreateNutritionGoal(entity);
        }

        public async Task<NutritionGoal> UpdateNutritionGoal(Guid id, NutritionGoalRequest request)
        {
            var entity = await _nutritionGoalRepo.GetNutritionGoalById(id);

            if (entity == null)
                throw new Exception("NutritionGoal not found");

            entity.Account_id = request.Account_id;
            entity.TargetCalories = request.TargetCalories;
            entity.TargetProtein = request.TargetProtein;
            entity.TargetCarbs = request.TargetCarbs;
            entity.TargetFat = request.TargetFat;
            entity.TargetFiber = request.TargetFiber;
            entity.TargetSugar = request.TargetSugar;
            entity.TargetSalt = request.TargetSalt;
            entity.TargetCholesterol = request.TargetCholesterol;

            return await _nutritionGoalRepo.UpdateNutritionGoal(entity);
        }

        public async Task<NutritionGoal> SoftDeleteNutritionGoal(Guid id)
        {
            return await _nutritionGoalRepo.SoftDeleteNutritionGoal(id);
        }
    }
}
