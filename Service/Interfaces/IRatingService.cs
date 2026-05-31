using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRatingService
    {
        Task<List<RatingResponse>> GetAllRatings();
        Task<RatingResponse?> GetRatingById(Guid id);
        Task<List<RatingResponse>> GetRatingsByRecipeId(Guid recipeId);
        Task<List<RatingResponse>> GetRatingsByAccountId(Guid accountId);
        Task<RatingResponse> CreateRating(RatingRequest request, Guid accountId);
        Task<RatingResponse> UpdateRating(Guid id, RatingUpdateRequest request, Guid accountId);
        Task<RatingResponse> SoftDeleteRating(Guid id, Guid accountId);
    }
}
