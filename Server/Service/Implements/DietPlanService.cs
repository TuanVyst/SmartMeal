using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class DietPlanService : IDietPlanService
    {
        private readonly IDietPlanRepo _dietPlanRepo;

        public DietPlanService(IDietPlanRepo dietPlanRepo)
        {
            _dietPlanRepo = dietPlanRepo;
        }

        public async Task<List<DietPlan>> GetAllDietPlans()
        {
            return await _dietPlanRepo.GetAllDietPlans();
        }

        public async Task<DietPlan> GetDietPlanById(Guid id)
        {
            return await _dietPlanRepo.GetDietPlanById(id);
        }

        public async Task<DietPlan> CreateDietPlan(DietPlanRequest request)
        {
            var dietPlan = new DietPlan
            {
                Diet_id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                TargetCalories = request.TargetCalories,
                MaxCarbs = request.MaxCarbs,
                MaxFat = request.MaxFat,
                MinProtein = request.MinProtein,
                IsDeleted = false
            };

            return await _dietPlanRepo.CreateDietPlan(dietPlan);
        }

        public async Task<DietPlan> UpdateDietPlan(Guid id, DietPlanRequest request)
        {
            var dietPlan = await _dietPlanRepo.GetDietPlanById(id);

            if (dietPlan == null)
                throw new Exception("DietPlan not found");

            dietPlan.Name = request.Name;
            dietPlan.Description = request.Description;
            dietPlan.TargetCalories = request.TargetCalories;
            dietPlan.MaxCarbs = request.MaxCarbs;
            dietPlan.MaxFat = request.MaxFat;
            dietPlan.MinProtein = request.MinProtein;

            return await _dietPlanRepo.UpdateDietPlan(dietPlan);
        }

        public async Task<DietPlan> SoftDeleteDietPlan(Guid id)
        {
            return await _dietPlanRepo.SoftDeleteDietPlan(id);
        }
    }
}