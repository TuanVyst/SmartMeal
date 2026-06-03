using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IAllergyService
    {
        Task<List<AllergyResponseDto>> GetAllAllergies();
        Task<AllergyResponseDto?> GetAllergyById(Guid id);
        Task<AllergyResponseDto> CreateAllergy(AllergyRequest allergy);
        Task<AllergyResponseDto> UpdateAllergy(Guid id, AllergyRequest allergy);
        Task<AllergyResponseDto> SoftDeleteAllergy(Guid id);
    }
}
