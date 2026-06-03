using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRatingService
    {
        Task<List<RatingResponseDto>> GetAllRatings();
        Task<RatingResponseDto?> GetRatingById(Guid id);
        Task<RatingResponseDto> CreateRating(RatingRequest rating);
        Task<RatingResponseDto> UpdateRating(Guid id, RatingRequest rating);
        Task<RatingResponseDto> SoftDeleteRating(Guid id);
    }
}
