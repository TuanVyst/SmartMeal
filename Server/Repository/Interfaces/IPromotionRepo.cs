using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IPromotionRepo
    {
        Task<List<Promotion>> GetAllWithPlansAsync();
        Task<Promotion?> GetByIdWithPlansAsync(Guid id);

        /// <summary>
        /// Returns the active promotion for each plan (at most one per plan) in a single query.
        /// </summary>
        Task<Dictionary<Guid, Promotion>> GetActiveByPlanIdsAsync(IReadOnlyCollection<Guid> planIds, DateTime atUtc);

        /// <summary>
        /// True when any non-deleted, enabled promotion already covers one of the plans
        /// in the given window.
        /// </summary>
        Task<bool> HasOverlapAsync(IReadOnlyCollection<Guid> planIds, DateTime startAt, DateTime endAt, Guid? excludePromoId);

        Task<Promotion> CreateAsync(Promotion promotion);
        Task<Promotion> UpdateAsync(Promotion promotion);
        Task<Promotion> SoftDeleteAsync(Guid id);
    }
}
