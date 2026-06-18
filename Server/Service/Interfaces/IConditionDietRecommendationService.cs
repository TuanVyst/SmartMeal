using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface IConditionDietRecommendationService
    {
        Task<List<ConditionDietRecommendation>> GetAllConditionDietRecommendations();

        Task<ConditionDietRecommendation> GetConditionDietRecommendationById(Guid id);

        Task<ConditionDietRecommendation> CreateConditionDietRecommendation(ConditionDietRecommendationRequest request);

        Task<ConditionDietRecommendation> UpdateConditionDietRecommendation(Guid id, ConditionDietRecommendationRequest request);

        Task<ConditionDietRecommendation> SoftDeleteConditionDietRecommendation(Guid id);
    }
}
