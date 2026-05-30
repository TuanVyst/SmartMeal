using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IAllergyRepo
    {
        Task<List<Allergy>> GetAllAllergies();
        Task<Allergy?> GetAllergyById(Guid id);
        Task<List<Allergy>> GetAllergiesByAccountId(Guid accountId);
        Task<Allergy?> GetAllergyByAccountAndIngredient(Guid accountId, Guid ingredientId);
        Task<Allergy> CreateAllergy(Allergy allergy);
        Task<Allergy> UpdateAllergy(Allergy allergy);
        Task<Allergy> SoftDeleteAllergy(Guid id);
    }
}
