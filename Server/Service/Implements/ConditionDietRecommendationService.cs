using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class ConditionDietRecommendationService : IConditionDietRecommendationService
    {
        private readonly IConditionDietRecommendationRepo _repo;

        public ConditionDietRecommendationService(IConditionDietRecommendationRepo repo)
        {
            _repo = repo;
        }

        public async Task<List<ConditionDietRecommendation>> GetAllConditionDietRecommendations()
        {
            return await _repo.GetAllConditionDietRecommendations();
        }

        public async Task<ConditionDietRecommendation> GetConditionDietRecommendationById(Guid id)
        {
            return await _repo.GetConditionDietRecommendationById(id);
        }

        public async Task<ConditionDietRecommendation> CreateConditionDietRecommendation(ConditionDietRecommendationRequest request)
        {
            var entity = new ConditionDietRecommendation
            {
                Rec_id = Guid.NewGuid(),
                Condition_id = request.Condition_id,
                Diet_id = request.Diet_id,
                Priority = request.Priority,
                Notes = request.Notes,
                IsDeleted = false
            };

            return await _repo.CreateConditionDietRecommendation(entity);
        }

        public async Task<ConditionDietRecommendation> UpdateConditionDietRecommendation(Guid id, ConditionDietRecommendationRequest request)
        {
            var entity = await _repo.GetConditionDietRecommendationById(id);

            if (entity == null)
                throw new Exception("ConditionDietRecommendation not found");

            entity.Condition_id = request.Condition_id;
            entity.Diet_id = request.Diet_id;
            entity.Priority = request.Priority;
            entity.Notes = request.Notes;

            return await _repo.UpdateConditionDietRecommendation(entity);
        }

        public async Task<ConditionDietRecommendation> SoftDeleteConditionDietRecommendation(Guid id)
        {
            return await _repo.SoftDeleteConditionDietRecommendation(id);
        }
    }
}
