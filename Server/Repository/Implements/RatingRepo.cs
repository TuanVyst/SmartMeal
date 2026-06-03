using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class RatingRepo : IRatingRepo
    {
        private readonly AppDbContext _ctx;
        public RatingRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Rating>> GetAllRatings()
        {
            return await _ctx.Ratings
                .Include(r => r.Account)
                .Include(r => r.Recipe)
                .Where(r => r.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Rating?> GetRatingById(Guid id)
            => await _ctx.Ratings
                .Include(r => r.Account)
                .Include(r => r.Recipe)
                .Where(r => !r.IsDeleted)
                .FirstOrDefaultAsync(r => r.Rating_id == id);

        public async Task<List<Rating>> GetRatingsByRecipeId(Guid recipeId)
            => await _ctx.Ratings
                .Include(r => r.Account)
                .Include(r => r.Recipe)
                .Where(r => r.Recipe_id == recipeId && r.IsDeleted == false)
                .ToListAsync();

        public async Task<List<Rating>> GetRatingsByAccountId(Guid accountId)
            => await _ctx.Ratings
                .Include(r => r.Account)
                .Include(r => r.Recipe)
                .Where(r => r.Account_id == accountId && r.IsDeleted == false)
                .ToListAsync();

        public async Task<Rating?> GetRatingByAccountAndRecipe(Guid accountId, Guid recipeId)
            => await _ctx.Ratings
                .Include(r => r.Account)
                .Include(r => r.Recipe)
                .Where(r => r.Account_id == accountId && r.Recipe_id == recipeId && r.IsDeleted == false)
                .FirstOrDefaultAsync();

        public async Task<Rating> CreateRating(Rating rating)
        {
            _ctx.Ratings.Add(rating);
            await _ctx.SaveChangesAsync();
            return rating;
        }

        public async Task<Rating> UpdateRating(Rating rating)
        {
            _ctx.Ratings.Update(rating);
            await _ctx.SaveChangesAsync();
            return rating;
        }

        public async Task<Rating> SoftDeleteRating(Guid id)
        {
            var existingRating = await _ctx.Ratings
                .Where(r => r.IsDeleted == false && r.Rating_id == id)
                .FirstOrDefaultAsync();
            if (existingRating == null)
                throw new KeyNotFoundException($"Rating with id {id} not found");
            existingRating.IsDeleted = true;
            _ctx.Ratings.Update(existingRating);
            await _ctx.SaveChangesAsync();
            return existingRating;
        }
    }
}
