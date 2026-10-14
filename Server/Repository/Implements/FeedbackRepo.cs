using BusinessObject.Entities;
using BusinessObject.Enums;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class FeedbackRepo : IFeedbackRepo
    {
        private readonly AppDbContext _context;

        public FeedbackRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Feedback> CreateFeedbackAsync(Feedback feedback)
        {
            await _context.Feedbacks.AddAsync(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<Feedback?> GetFeedbackByIdAsync(Guid feedbackId)
        {
            return await _context.Feedbacks
                .Include(f => f.Account)
                .Include(f => f.RepliedByAccount)
                .FirstOrDefaultAsync(f => f.Feedback_id == feedbackId && !f.IsDeleted);
        }

        public async Task<List<Feedback>> GetFeedbacksByAccountIdAsync(Guid accountId)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Include(f => f.RepliedByAccount)
                .Where(f => f.Account_id == accountId && !f.IsDeleted)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<(List<Feedback> Items, int TotalCount)> GetFeedbacksPagedAsync(
            FeedbackStatusEnum? status,
            FeedbackCategoryEnum? category,
            string? search,
            int pageIndex,
            int pageSize)
        {
            var query = _context.Feedbacks
                .AsNoTracking()
                .Include(f => f.Account)
                .Include(f => f.RepliedByAccount)
                .Where(f => !f.IsDeleted);

            if (status.HasValue)
            {
                query = query.Where(f => f.Status == status.Value);
            }

            if (category.HasValue)
            {
                query = query.Where(f => f.Category == category.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(f =>
                    f.Title.ToLower().Contains(term) ||
                    f.Content.ToLower().Contains(term) ||
                    (f.ContactEmail != null && f.ContactEmail.ToLower().Contains(term)) ||
                    (f.Account != null && (
                        (f.Account.Username != null && f.Account.Username.ToLower().Contains(term)) ||
                        (f.Account.Email != null && f.Account.Email.ToLower().Contains(term)) ||
                        (f.Account.Name != null && f.Account.Name.ToLower().Contains(term))
                    ))
                );
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Feedback> UpdateFeedbackAsync(Feedback feedback)
        {
            _context.Feedbacks.Update(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<bool> SoftDeleteFeedbackAsync(Guid feedbackId)
        {
            var item = await _context.Feedbacks.FirstOrDefaultAsync(f => f.Feedback_id == feedbackId && !f.IsDeleted);
            if (item == null) return false;

            item.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
