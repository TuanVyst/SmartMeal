using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Microsoft.Extensions.Logging;
using Repository.Interfaces;
using Service.Interfaces;
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

        public async Task<List<RatingResponse>> GetAllRatings()
        {
            var ratings = await _ratingRepo.GetAllRatings();
            return ratings.Select(MapToResponse).ToList();
        }

        public async Task<RatingResponse?> GetRatingById(Guid id)
        {
            var rating = await _ratingRepo.GetRatingById(id);
            if (rating == null) return null;
            return MapToResponse(rating);
        }

        public async Task<List<RatingResponse>> GetRatingsByRecipeId(Guid recipeId)
        {
            var ratings = await _ratingRepo.GetRatingsByRecipeId(recipeId);
            return ratings.Select(MapToResponse).ToList();
        }

        public async Task<List<RatingResponse>> GetRatingsByAccountId(Guid accountId)
        {
            var ratings = await _ratingRepo.GetRatingsByAccountId(accountId);
            return ratings.Select(MapToResponse).ToList();
        }

        public async Task<RatingResponse> CreateRating(RatingRequest request, Guid accountId)
        {
            try
            {
                if (request.RatingValue < 0.5m || request.RatingValue > 5.0m)
                    throw new ArgumentException("Rating value must be between 0.5 and 5.0", nameof(request.RatingValue));

                if (string.IsNullOrWhiteSpace(request.Review))
                    throw new ArgumentException("Review must not be null or empty", nameof(request.Review));

                if (request.Recipe_id == Guid.Empty)
                    throw new ArgumentException("Recipe_id is required", nameof(request.Recipe_id));

                var existingRating = await _ratingRepo.GetRatingByAccountAndRecipe(accountId, request.Recipe_id);
                if (existingRating != null)
                    throw new InvalidOperationException("You have already rated this recipe");

                var newRating = new Rating
                {
                    Rating_id = Guid.NewGuid(),
                    Account_id = accountId,
                    Recipe_id = request.Recipe_id,
                    RatingValue = request.RatingValue,
                    Review = request.Review,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var result = await _ratingRepo.CreateRating(newRating);
                _logger.LogInformation("Rating '{RatingId}' created for Recipe '{RecipeId}' by Account '{AccountId}'", newRating.Rating_id, request.Recipe_id, accountId);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating rating for recipe '{RecipeId}' by account '{AccountId}'", request.Recipe_id, accountId);
                throw;
            }
        }

        public async Task<RatingResponse> UpdateRating(Guid id, RatingUpdateRequest request, Guid accountId)
        {
            try
            {
                var existingRating = await _ratingRepo.GetRatingById(id);
                if (existingRating == null)
                    throw new KeyNotFoundException($"Rating with id {id} not found");

                if (existingRating.Account_id != accountId)
                    throw new UnauthorizedAccessException("You do not have permission to update this rating");

                if (request.RatingValue.HasValue)
                {
                    if (request.RatingValue < 0.5m || request.RatingValue > 5.0m)
                        throw new ArgumentException("Rating value must be between 0.5 and 5.0", nameof(request.RatingValue));
                    existingRating.RatingValue = request.RatingValue.Value;
                }
                if (request.Review != null)
                    existingRating.Review = request.Review;

                var result = await _ratingRepo.UpdateRating(existingRating);
                _logger.LogInformation("Rating '{RatingId}' updated successfully", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating rating '{RatingId}'", id);
                throw;
            }
        }

        public async Task<RatingResponse> SoftDeleteRating(Guid id, Guid accountId)
        {
            try
            {
                var existingRating = await _ratingRepo.GetRatingById(id);
                if (existingRating == null)
                    throw new KeyNotFoundException($"Rating with id {id} not found");

                if (existingRating.Account_id != accountId)
                    throw new UnauthorizedAccessException("You do not have permission to delete this rating");

                var result = await _ratingRepo.SoftDeleteRating(id);
                _logger.LogInformation("Rating '{RatingId}' soft deleted", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting rating '{RatingId}'", id);
                throw;
            }
        }

        private RatingResponse MapToResponse(Rating rating)
        {
            return new RatingResponse
            {
                Rating_id = rating.Rating_id,
                Account_id = rating.Account_id,
                AccountUsername = rating.Account?.Username ?? string.Empty,
                Recipe_id = rating.Recipe_id,
                RecipeName = rating.Recipe?.Recipe_name ?? string.Empty,
                RatingValue = rating.RatingValue,
                Review = rating.Review,
                CreatedAt = rating.CreatedAt
            };
        }
    }
}
