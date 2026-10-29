using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IAllergyService
    {
        Task<List<AllergyResponseDto>> GetAllAllergies(CancellationToken cancellationToken = default);
        Task<List<AllergyResponseDto>> GetAllergiesByAccountId(Guid accountId, CancellationToken cancellationToken = default);
        Task<AllergyResponseDto?> GetAllergyById(Guid id, CancellationToken cancellationToken = default);
        Task<AllergyResponseDto> CreateAllergy(AllergyRequest allergy, CancellationToken cancellationToken = default);
        Task<AllergyResponseDto> UpdateAllergy(Guid id, AllergyRequest allergy, CancellationToken cancellationToken = default);
        Task<AllergyResponseDto> SoftDeleteAllergy(Guid id, CancellationToken cancellationToken = default);
    }
}
