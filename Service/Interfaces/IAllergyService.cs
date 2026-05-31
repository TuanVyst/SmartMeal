using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IAllergyService
    {
        Task<List<AllergyResponse>> GetAllAllergies();
        Task<AllergyResponse?> GetAllergyById(Guid id);
        Task<List<AllergyResponse>> GetAllergiesByAccountId(Guid accountId);
        Task<AllergyResponse> CreateAllergy(AllergyRequest request, Guid accountId);
        Task<AllergyResponse> UpdateAllergy(Guid id, AllergyRequest request, Guid accountId);
        Task<AllergyResponse> SoftDeleteAllergy(Guid id, Guid accountId);
    }
}
