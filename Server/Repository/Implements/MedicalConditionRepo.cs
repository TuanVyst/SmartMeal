using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class MedicalConditionRepo : IMedicalConditionRepo
    {
        private readonly AppDbContext _ctx;

        public MedicalConditionRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<MedicalCondition>> GetAllMedicalConditions()
        {
            return await _ctx.MedicalConditions
                .Where(x => x.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<MedicalCondition?> GetMedicalConditionById(Guid id)
        {
            return await _ctx.MedicalConditions
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Condition_id == id);
        }

        public async Task<MedicalCondition> CreateMedicalCondition(MedicalCondition medicalCondition)
        {
            _ctx.MedicalConditions.Add(medicalCondition);
            await _ctx.SaveChangesAsync();

            return medicalCondition;
        }

        public async Task<MedicalCondition> UpdateMedicalCondition(MedicalCondition medicalCondition)
        {
            _ctx.MedicalConditions.Update(medicalCondition);
            await _ctx.SaveChangesAsync();

            return medicalCondition;
        }

        public async Task<MedicalCondition> SoftDeleteMedicalCondition(Guid id)
        {
            var medicalCondition = await _ctx.MedicalConditions
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Condition_id == id);

            if (medicalCondition == null)
                throw new Exception("MedicalCondition not found");

            medicalCondition.IsDeleted = true;

            _ctx.MedicalConditions.Update(medicalCondition);
            await _ctx.SaveChangesAsync();

            return medicalCondition;
        }
    }
}