using BusinessObject.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Repository.Interfaces
{
    public interface IAllergyRepo
    {
        Task<List<Allergy>> GetAllAllergies(CancellationToken cancellationToken = default);
        Task<List<Allergy>> GetAllergiesByAccountId(Guid accountId, CancellationToken cancellationToken = default);
        Task<Allergy?> GetAllergyById(Guid id, CancellationToken cancellationToken = default);
        Task<Allergy?> GetAllergyByAccountAndIngredient(Guid accountId, Guid ingredientId, CancellationToken cancellationToken = default);
        Task<Allergy> CreateAllergy(Allergy allergy, CancellationToken cancellationToken = default);
        Task<Allergy> UpdateAllergy(Allergy allergy, CancellationToken cancellationToken = default);
        Task<Allergy> SoftDeleteAllergy(Guid id, CancellationToken cancellationToken = default);
    }
}
