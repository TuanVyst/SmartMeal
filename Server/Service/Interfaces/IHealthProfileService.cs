using BusinessObject.Entities;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IHealthProfileService
    {
        Task<List<HealthProfile>> GetAllHealthProfiles();

        Task<HealthProfile> GetHealthProfileById(Guid id);

        Task<HealthProfile?> GetHealthProfileByAccountId(Guid accountId);

        Task<HealthProfile> CreateHealthProfile(HealthProfileRequest request);

        Task<HealthProfile> UpdateHealthProfile(Guid id, HealthProfileRequest request);

        Task<HealthProfile> SoftDeleteHealthProfile(Guid id);
    }
}