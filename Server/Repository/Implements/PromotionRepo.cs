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
    public class PromotionRepo : IPromotionRepo
    {
        private readonly AppDbContext _ctx;

        public PromotionRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Promotion>> GetAllWithPlansAsync()
        {
            return await _ctx.Promotions
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .Include(p => p.PromotionPlans)
                    .ThenInclude(pp => pp.Plan)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Promotion?> GetByIdWithPlansAsync(Guid id)
        {
            return await _ctx.Promotions
                .AsNoTracking()
                .Where(p => !p.IsDeleted && p.Promo_id == id)
                .Include(p => p.PromotionPlans)
                    .ThenInclude(pp => pp.Plan)
                .FirstOrDefaultAsync();
        }

        public async Task<Dictionary<Guid, Promotion>> GetActiveByPlanIdsAsync(
            IReadOnlyCollection<Guid> planIds, DateTime atUtc)
        {
            var result = new Dictionary<Guid, Promotion>();
            if (planIds == null || planIds.Count == 0) return result;

            var ids = planIds.Distinct().ToList();

            var rows = await _ctx.PromotionPlans
                .AsNoTracking()
                .Where(pp => ids.Contains(pp.Plan_id))
                .Select(pp => new { pp.Plan_id, pp.Promotion })
                .Where(x => x.Promotion.IsActive
                            && !x.Promotion.IsDeleted
                            && x.Promotion.StartAt <= atUtc
                            && x.Promotion.EndAt >= atUtc)
                .ToListAsync();

            foreach (var row in rows)
            {
                // Data integrity guarantees one active promotion per plan; keep the first defensively.
                if (!result.ContainsKey(row.Plan_id))
                    result[row.Plan_id] = row.Promotion;
            }

            return result;
        }

        public async Task<bool> HasOverlapAsync(
            IReadOnlyCollection<Guid> planIds, DateTime startAt, DateTime endAt, Guid? excludePromoId)
        {
            if (planIds == null || planIds.Count == 0) return false;

            var ids = planIds.Distinct().ToList();

            var query = _ctx.PromotionPlans
                .AsNoTracking()
                .Where(pp => ids.Contains(pp.Plan_id))
                .Select(pp => pp.Promotion)
                .Where(p => !p.IsDeleted && p.IsActive)
                .Where(p => p.StartAt < endAt && p.EndAt > startAt);

            if (excludePromoId.HasValue)
                query = query.Where(p => p.Promo_id != excludePromoId.Value);

            return await query.AnyAsync();
        }

        public async Task<Promotion> CreateAsync(Promotion promotion)
        {
            _ctx.Promotions.Add(promotion);
            await _ctx.SaveChangesAsync();
            return promotion;
        }

        public async Task<Promotion> UpdateAsync(Promotion promotion)
        {
            var existing = await _ctx.Promotions
                .Include(p => p.PromotionPlans)
                .FirstOrDefaultAsync(p => p.Promo_id == promotion.Promo_id);

            if (existing == null)
                throw new KeyNotFoundException($"Promotion with id {promotion.Promo_id} not found");

            existing.Name = promotion.Name;
            existing.DiscountPercent = promotion.DiscountPercent;
            existing.StartAt = promotion.StartAt;
            existing.EndAt = promotion.EndAt;
            existing.IsActive = promotion.IsActive;

            // Diff the plan links so unchanged rows are not deleted/reinserted.
            var desired = promotion.PromotionPlans.Select(pp => pp.Plan_id).ToHashSet();
            var current = existing.PromotionPlans.Select(pp => pp.Plan_id).ToHashSet();

            foreach (var stale in existing.PromotionPlans.Where(pp => !desired.Contains(pp.Plan_id)).ToList())
                existing.PromotionPlans.Remove(stale);

            foreach (var planId in desired.Where(id => !current.Contains(id)))
                existing.PromotionPlans.Add(new PromotionPlan { Promo_id = existing.Promo_id, Plan_id = planId });

            await _ctx.SaveChangesAsync();
            return existing;
        }

        public async Task<Promotion> SoftDeleteAsync(Guid id)
        {
            var existing = await _ctx.Promotions
                .Include(p => p.PromotionPlans)
                .FirstOrDefaultAsync(p => !p.IsDeleted && p.Promo_id == id);

            if (existing == null)
                throw new KeyNotFoundException($"Promotion with id {id} not found");

            existing.IsDeleted = true;
            existing.IsActive = false;

            await _ctx.SaveChangesAsync();
            return existing;
        }
    }
}
