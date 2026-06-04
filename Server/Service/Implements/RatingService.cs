using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepo _ratingRepo;
        private readonly ILogger<RatingService> _logger;

        public RatingService(IRatingRepo ratingRepo, ILogger<RatingService> logger)
        {
            _ratingRepo = ratingRepo;
            _logger = logger;
        }

        public async Task<List<RatingResponseDto>> GetAllRatings()
        {
            var ratings = await _ratingRepo.GetAllRatings();
            return ratings.Select(MapToDto).ToList();
        }

        public async Task<RatingResponseDto?> GetRatingById(Guid id)
        {
            var rating = await _ratingRepo.GetRatingById(id);
            return rating == null ? null : MapToDto(rating);
        }

        public async Task<RatingResponseDto> CreateRating(RatingRequest request)
        {
            try
            {
                var newRating = new Rating
                {
                    Rating_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
                    Recipe_id = request.Recipe_id,
                    RatingValue = request.RatingValue,
                    Review = request.Review,
                    IsDeleted = false
                };

                var result = await _ratingRepo.CreateRating(newRating);
                _logger.LogInformation("Rating '{Rating_id}' created successfully", newRating.Rating_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Rating");
                throw;
            }
        }

        public async Task<RatingResponseDto> UpdateRating(Guid id, RatingRequest request)
        {
            try
            {
                var existingItem = await _ratingRepo.GetRatingById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Rating with id {id} not found");

                existingItem.Account_id = request.Account_id;
                existingItem.Recipe_id = request.Recipe_id;
                existingItem.RatingValue = request.RatingValue;
                existingItem.Review = request.Review;

                var result = await _ratingRepo.UpdateRating(existingItem);
                _logger.LogInformation("Rating '{Rating_id}' updated successfully", existingItem.Rating_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Rating '{Rating_id}'", id);
                throw;
            }
        }

        public async Task<RatingResponseDto> SoftDeleteRating(Guid id)
        {
            var result = await _ratingRepo.SoftDeleteRating(id);
            return MapToDto(result);
        }
        
        private RatingResponseDto MapToDto(Rating entity)
        {
            if (entity == null) return null;
            return new RatingResponseDto
            {
                Rating_id = entity.Rating_id,
                Account_id = entity.Account_id,
                Recipe_id = entity.Recipe_id,
                RatingValue = entity.RatingValue,
                Review = entity.Review,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
