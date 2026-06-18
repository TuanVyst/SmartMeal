using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IConditionDietRecommendationRepo
    {
        Task<List<ConditionDietRecommendation>> GetAllConditionDietRecommendations();

        Task<ConditionDietRecommendation?> GetConditionDietRecommendationById(Guid id);

        Task<ConditionDietRecommendation> CreateConditionDietRecommendation(ConditionDietRecommendation entity);

        Task<ConditionDietRecommendation> UpdateConditionDietRecommendation(ConditionDietRecommendation entity);

        Task<ConditionDietRecommendation> SoftDeleteConditionDietRecommendation(Guid id);
    }
}
