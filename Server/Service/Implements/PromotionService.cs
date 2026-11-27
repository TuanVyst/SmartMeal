using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using BusinessObject.Helpers;
using Microsoft.Extensions.Logging;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class PromotionService : IPromotionService
    {
        private readonly IPromotionRepo _promotionRepo;
        private readonly IPlanRepo _planRepo;
        private readonly ILogger<PromotionService> _logger;

        public PromotionService(
            IPromotionRepo promotionRepo,
            IPlanRepo planRepo,
            ILogger<PromotionService> logger)
        {
            _promotionRepo = promotionRepo;
            _planRepo = planRepo;
            _logger = logger;
        }

        public async Task<List<PromotionResponseDto>> GetAllAsync()
        {
            var items = await _promotionRepo.GetAllWithPlansAsync();
            var now = DateTime.UtcNow;
            return items.Select(p => MapToDto(p, now)).ToList();
        }

        public async Task<PromotionResponseDto?> GetByIdAsync(Guid id)
        {
            var item = await _promotionRepo.GetByIdWithPlansAsync(id);
            return item == null ? null : MapToDto(item, DateTime.UtcNow);
        }

        public async Task<PromotionResponseDto> CreateAsync(PromotionRequest request, Guid? createdByAccountId)
        {
            var now = DateTime.UtcNow;
            var startAt = PlanPricingHelper.ToUtc(request.StartAt);
            var endAt = PlanPricingHelper.ToUtc(request.EndAt);

            var plans = await ValidateAsync(request, startAt, endAt, now, null);

            var entity = new Promotion
            {
                Promo_id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                DiscountPercent = request.DiscountPercent,
                StartAt = startAt,
                EndAt = endAt,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = now,
                CreatedByAccountId = createdByAccountId
            };

            foreach (var plan in plans)
                entity.PromotionPlans.Add(new PromotionPlan { Promo_id = entity.Promo_id, Plan_id = plan.Plan_id });

            await _promotionRepo.CreateAsync(entity);
            _logger.LogInformation("Promotion '{PromoId}' created for {PlanCount} plan(s)", entity.Promo_id, plans.Count);

            var created = await _promotionRepo.GetByIdWithPlansAsync(entity.Promo_id);
            return MapToDto(created ?? entity, now);
        }

        public async Task<PromotionResponseDto> UpdateAsync(Guid id, PromotionRequest request)
        {
            var now = DateTime.UtcNow;
            var existing = await _promotionRepo.GetByIdWithPlansAsync(id)
                ?? throw new KeyNotFoundException($"Không tìm thấy khuyến mãi {id}");

            var startAt = PlanPricingHelper.ToUtc(request.StartAt);
            var endAt = PlanPricingHelper.ToUtc(request.EndAt);

            var plans = await ValidateAsync(request, startAt, endAt, now, id);

            var toUpdate = new Promotion
            {
                Promo_id = existing.Promo_id,
                Name = request.Name.Trim(),
                DiscountPercent = request.DiscountPercent,
                StartAt = startAt,
                EndAt = endAt,
                IsActive = existing.IsActive
            };

            foreach (var plan in plans)
                toUpdate.PromotionPlans.Add(new PromotionPlan { Promo_id = id, Plan_id = plan.Plan_id });

            await _promotionRepo.UpdateAsync(toUpdate);
            _logger.LogInformation("Promotion '{PromoId}' updated", id);

            var updated = await _promotionRepo.GetByIdWithPlansAsync(id);
            return MapToDto(updated ?? toUpdate, now);
        }

        public async Task<PromotionResponseDto> EndAsync(Guid id)
        {
            var now = DateTime.UtcNow;
            var existing = await _promotionRepo.GetByIdWithPlansAsync(id)
                ?? throw new KeyNotFoundException($"Không tìm thấy khuyến mãi {id}");

            if (now < existing.StartAt)
            {
                // Not started yet: cancelling is the only meaningful "end".
                existing.IsActive = false;
            }
            else if (existing.EndAt > now)
            {
                existing.EndAt = now;
            }

            await _promotionRepo.UpdateAsync(existing);
            _logger.LogInformation("Promotion '{PromoId}' ended by admin", id);

            var updated = await _promotionRepo.GetByIdWithPlansAsync(id);
            return MapToDto(updated ?? existing, DateTime.UtcNow);
        }

        public async Task<PromotionResponseDto> DeleteAsync(Guid id)
        {
            var existing = await _promotionRepo.GetByIdWithPlansAsync(id)
                ?? throw new KeyNotFoundException($"Không tìm thấy khuyến mãi {id}");

            var dto = MapToDto(existing, DateTime.UtcNow);
            await _promotionRepo.SoftDeleteAsync(id);
            _logger.LogInformation("Promotion '{PromoId}' soft-deleted", id);
            return dto;
        }

        private async Task<List<Plan>> ValidateAsync(
            PromotionRequest request, DateTime startAt, DateTime endAt, DateTime now, Guid? excludePromoId)
        {
            var name = request.Name?.Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên khuyến mãi không được để trống.");
            if (name.Length > 100)
                throw new ArgumentException("Tên khuyến mãi tối đa 100 ký tự.");
            if (request.DiscountPercent < 1 || request.DiscountPercent > 99)
                throw new ArgumentException("Phần trăm giảm giá phải nằm trong khoảng 1 - 99.");
            if (endAt <= startAt)
                throw new ArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu.");
            if (endAt <= now)
                throw new ArgumentException("Thời gian kết thúc phải ở tương lai.");

            var planIds = (request.PlanIds ?? new List<Guid>())
                .Where(pid => pid != Guid.Empty)
                .Distinct()
                .ToList();

            if (planIds.Count == 0)
                throw new ArgumentException("Vui lòng chọn ít nhất một gói dịch vụ.");

            var allPlans = await _planRepo.GetAllPlans();
            var lookup = allPlans.ToDictionary(p => p.Plan_id);

            var plans = new List<Plan>();
            foreach (var planId in planIds)
            {
                if (!lookup.TryGetValue(planId, out var plan))
                    throw new ArgumentException("Gói dịch vụ không tồn tại hoặc đã bị xoá.");

                if (plan.Price <= 0)
                    throw new ArgumentException($"Gói '{plan.Name}' là gói miễn phí, không thể áp dụng khuyến mãi.");

                var discounted = Math.Round(
                    plan.Price * (100 - request.DiscountPercent) / 100,
                    0,
                    MidpointRounding.AwayFromZero);

                if (discounted < PlanPricingHelper.MinimumChargeableAmount)
                    throw new ArgumentException($"Giá sau giảm của gói '{plan.Name}' thấp hơn 1.000 ₫.");

                plans.Add(plan);
            }

            if (await _promotionRepo.HasOverlapAsync(planIds, startAt, endAt, excludePromoId))
                throw new InvalidOperationException("Khoảng thời gian khuyến mãi trùng với một khuyến mãi khác của cùng gói.");

            return plans;
        }

        private static PromotionResponseDto MapToDto(Promotion entity, DateTime now)
        {
            return new PromotionResponseDto
            {
                Promo_id = entity.Promo_id,
                Name = entity.Name,
                DiscountPercent = entity.DiscountPercent,
                StartAt = entity.StartAt,
                EndAt = entity.EndAt,
                IsActive = entity.IsActive,
                Status = PlanPricingHelper.DeriveStatus(entity, now),
                CreatedAt = entity.CreatedAt,
                Plans = (entity.PromotionPlans ?? new List<PromotionPlan>())
                    .Where(pp => pp.Plan != null)
                    .Select(pp => new PromotionPlanDto
                    {
                        Plan_id = pp.Plan_id,
                        Name = pp.Plan.Name,
                        Price = pp.Plan.Price,
                        EffectivePrice = PlanPricingHelper.ComputeDiscountedPrice(pp.Plan.Price, entity.DiscountPercent)
                    })
                    .ToList()
            };
        }
    }
}
