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
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Rating?> GetRatingById(Guid id)
            => await _ctx.Ratings
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Rating_id == id);

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
            var rating = _ctx.Ratings.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Rating_id == id);
            if (rating == null)
                throw new Exception("Rating not found");
            rating.IsDeleted = true;
            _ctx.Ratings.Update(rating);
            await _ctx.SaveChangesAsync();
            return rating;
        }
    }
}
