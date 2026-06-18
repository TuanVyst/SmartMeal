using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface IMedicalConditionService
    {
        Task<List<MedicalCondition>> GetAllMedicalConditions();
        Task<MedicalCondition> GetMedicalConditionById(Guid id);
        Task<MedicalCondition> CreateMedicalCondition(MedicalConditionRequest request);
        Task<MedicalCondition> UpdateMedicalCondition(Guid id, MedicalConditionRequest request);
        Task<MedicalCondition> SoftDeleteMedicalCondition(Guid id);
    }
}
