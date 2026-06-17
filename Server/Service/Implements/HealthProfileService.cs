using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class HealthProfileService : IHealthProfileService
    {
        private readonly IHealthProfileRepo _healthProfileRepo;

        public HealthProfileService(IHealthProfileRepo healthProfileRepo)
        {
            _healthProfileRepo = healthProfileRepo;
        }

        public async Task<List<HealthProfile>> GetAllHealthProfiles()
        {
            return await _healthProfileRepo.GetAllHealthProfiles();
        }

        public async Task<HealthProfile> GetHealthProfileById(Guid id)
        {
            return await _healthProfileRepo.GetHealthProfileById(id);
        }

        public async Task<HealthProfile> CreateHealthProfile(HealthProfileRequest request)
        {
            var healthProfile = new HealthProfile
            {
                Profile_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Height = request.Height,
                Weight = request.Weight,
                ActivityLevel = request.ActivityLevel,
                Goal = request.Goal,
                UpdatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            return await _healthProfileRepo.CreateHealthProfile(healthProfile);
        }

        public async Task<HealthProfile> UpdateHealthProfile(Guid id, HealthProfileRequest request)
        {
            var healthProfile = await _healthProfileRepo.GetHealthProfileById(id);

            if (healthProfile == null)
                throw new Exception("HealthProfile not found");

            healthProfile.DateOfBirth = request.DateOfBirth;
            healthProfile.Gender = request.Gender;
            healthProfile.Height = request.Height;
            healthProfile.Weight = request.Weight;
            healthProfile.ActivityLevel = request.ActivityLevel;
            healthProfile.Goal = request.Goal;
            healthProfile.UpdatedAt = DateTime.UtcNow;

            return await _healthProfileRepo.UpdateHealthProfile(healthProfile);
        }

        public async Task<HealthProfile> SoftDeleteHealthProfile(Guid id)
        {
            return await _healthProfileRepo.SoftDeleteHealthProfile(id);
        }
    }
}