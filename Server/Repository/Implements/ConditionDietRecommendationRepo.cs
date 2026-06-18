using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class ConditionDietRecommendationRepo : IConditionDietRecommendationRepo
    {
        private readonly AppDbContext _ctx;

        public ConditionDietRecommendationRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<ConditionDietRecommendation>> GetAllConditionDietRecommendations()
        {
            return await _ctx.ConditionDietRecommendations
                .Include(x => x.MedicalCondition)
                .Include(x => x.DietPlan)
                .Where(x => x.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<ConditionDietRecommendation?> GetConditionDietRecommendationById(Guid id)
        {
            return await _ctx.ConditionDietRecommendations
                .Include(x => x.MedicalCondition)
                .Include(x => x.DietPlan)
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Rec_id == id);
        }

        public async Task<ConditionDietRecommendation> CreateConditionDietRecommendation(ConditionDietRecommendation entity)
        {
            _ctx.ConditionDietRecommendations.Add(entity);
            await _ctx.SaveChangesAsync();

            return entity;
        }

        public async Task<ConditionDietRecommendation> UpdateConditionDietRecommendation(ConditionDietRecommendation entity)
        {
            _ctx.ConditionDietRecommendations.Update(entity);
            await _ctx.SaveChangesAsync();

            return entity;
        }

        public async Task<ConditionDietRecommendation> SoftDeleteConditionDietRecommendation(Guid id)
        {
            var entity = await _ctx.ConditionDietRecommendations
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Rec_id == id);

            if (entity == null)
                throw new Exception("ConditionDietRecommendation not found");

            entity.IsDeleted = true;

            _ctx.ConditionDietRecommendations.Update(entity);
            await _ctx.SaveChangesAsync();

            return entity;
        }
    }
}
