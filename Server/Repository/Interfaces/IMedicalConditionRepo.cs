using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IMedicalConditionRepo
    {
        Task<List<MedicalCondition>> GetAllMedicalConditions();

        Task<MedicalCondition?> GetMedicalConditionById(Guid id);

        Task<MedicalCondition> CreateMedicalCondition(MedicalCondition medicalCondition);

        Task<MedicalCondition> UpdateMedicalCondition(MedicalCondition medicalCondition);

        Task<MedicalCondition> SoftDeleteMedicalCondition(Guid id);
    }
}