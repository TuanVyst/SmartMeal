using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IRatingRepo
    {
        Task<List<Rating>> GetAllRatings();
        Task<Rating?> GetRatingById(Guid id);
        Task<List<Rating>> GetRatingsByRecipeId(Guid recipeId);
        Task<List<Rating>> GetRatingsByAccountId(Guid accountId);
        Task<Rating?> GetRatingByAccountAndRecipe(Guid accountId, Guid recipeId);
        Task<Rating> CreateRating(Rating rating);
        Task<Rating> UpdateRating(Rating rating);
        Task<Rating> SoftDeleteRating(Guid id);
    }
}
