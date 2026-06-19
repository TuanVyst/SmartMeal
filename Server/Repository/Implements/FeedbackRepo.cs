using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class FeedbackRepo : IFeedbackRepo
    {
        private readonly AppDbContext _ctx;

        public FeedbackRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Feedback>> GetAllFeedbacks()
        {
            return await _ctx.Set<Feedback>()
                .Include(f => f.Account)
                .Where(f => f.IsDeleted == false)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<Feedback?> GetFeedbackById(Guid id)
        {
            return await _ctx.Set<Feedback>()
                .Include(f => f.Account)
                .Where(f => f.IsDeleted == false)
                .FirstOrDefaultAsync(f => f.Feedback_id == id);
        }

        public async Task<Feedback> CreateFeedback(Feedback feedback)
        {
            _ctx.Set<Feedback>().Add(feedback);
            await _ctx.SaveChangesAsync();
            return feedback;
        }

        public async Task<Feedback> UpdateFeedback(Feedback feedback)
        {
            _ctx.Set<Feedback>().Update(feedback);
            await _ctx.SaveChangesAsync();
            return feedback;
        }

        public async Task<Feedback> SoftDeleteFeedback(Guid id)
        {
            var entity = await _ctx.Set<Feedback>()
                .Where(f => f.IsDeleted == false)
                .FirstOrDefaultAsync(f => f.Feedback_id == id);

            if (entity == null)
                throw new Exception("Feedback not found");

            entity.IsDeleted = true;
            _ctx.Set<Feedback>().Update(entity);
            await _ctx.SaveChangesAsync();
            return entity;
        }
    }
}
