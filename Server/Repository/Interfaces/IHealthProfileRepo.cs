using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IHealthProfileRepo
    {
        Task<List<HealthProfile>> GetAllHealthProfiles();

        Task<HealthProfile?> GetHealthProfileById(Guid id);

        Task<HealthProfile?> GetHealthProfileByAccountId(Guid accountId);

        Task<HealthProfile> CreateHealthProfile(HealthProfile healthProfile);

        Task<HealthProfile> UpdateHealthProfile(HealthProfile healthProfile);

        Task<HealthProfile> SoftDeleteHealthProfile(Guid id);
    }
}