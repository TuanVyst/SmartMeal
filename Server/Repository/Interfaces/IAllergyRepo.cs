using BusinessObject.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Repository.Interfaces
{
    public interface IAllergyRepo
    {
        Task<List<Allergy>> GetAllAllergies();
        Task<Allergy?> GetAllergyById(Guid id);
        Task<Allergy> CreateAllergy(Allergy allergy);
        Task<Allergy> UpdateAllergy(Allergy allergy);
        Task<Allergy> SoftDeleteAllergy(Guid id);
    }
}
