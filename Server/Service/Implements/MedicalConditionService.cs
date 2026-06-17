using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class MedicalConditionService : IMedicalConditionService
    {
        private readonly IMedicalConditionRepo _medicalConditionRepo;

        public MedicalConditionService(IMedicalConditionRepo medicalConditionRepo)
        {
            _medicalConditionRepo = medicalConditionRepo;
        }

        public async Task<List<MedicalCondition>> GetAllMedicalConditions()
        {
            return await _medicalConditionRepo.GetAllMedicalConditions();
        }

        public async Task<MedicalCondition> GetMedicalConditionById(Guid id)
        {
            return await _medicalConditionRepo.GetMedicalConditionById(id);
        }

        public async Task<MedicalCondition> CreateMedicalCondition(MedicalConditionRequest request)
        {
            var medicalCondition = new MedicalCondition
            {
                Condition_id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Category = request.Category,
                IsDeleted = false
            };

            return await _medicalConditionRepo.CreateMedicalCondition(medicalCondition);
        }

        public async Task<MedicalCondition> UpdateMedicalCondition(Guid id, MedicalConditionRequest request)
        {
            var medicalCondition = await _medicalConditionRepo.GetMedicalConditionById(id);

            if (medicalCondition == null)
                throw new Exception("MedicalCondition not found");

            medicalCondition.Name = request.Name;
            medicalCondition.Description = request.Description;
            medicalCondition.Category = request.Category;

            return await _medicalConditionRepo.UpdateMedicalCondition(medicalCondition);
        }

        public async Task<MedicalCondition> SoftDeleteMedicalCondition(Guid id)
        {
            return await _medicalConditionRepo.SoftDeleteMedicalCondition(id);
        }
    }
}