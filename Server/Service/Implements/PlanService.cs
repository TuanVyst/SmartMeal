using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using BusinessObject.Helpers;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class PlanService : IPlanService
    {
        private readonly IPlanRepo _planRepo;
        private readonly IPromotionRepo _promotionRepo;
        private readonly ILogger<PlanService> _logger;

        public PlanService(IPlanRepo planRepo, IPromotionRepo promotionRepo, ILogger<PlanService> logger)
        {
            _planRepo = planRepo;
            _promotionRepo = promotionRepo;
            _logger = logger;
        }

        public async Task<List<PlanResponseDto>> GetAllPlans()
        {
            var items = await _planRepo.GetAllPlans();
            var now = DateTime.UtcNow;
            var promotions = await _promotionRepo.GetActiveByPlanIdsAsync(
                items.Select(i => i.Plan_id).ToList(), now);

            return items
                .Select(i => MapToDto(i, promotions.GetValueOrDefault(i.Plan_id), now))
                .ToList();
        }

        public async Task<PlanResponseDto?> GetPlanById(Guid id)
        {
            var item = await _planRepo.GetPlanById(id);
            if (item == null) return null;

            var now = DateTime.UtcNow;
            var promotions = await _promotionRepo.GetActiveByPlanIdsAsync(new List<Guid> { id }, now);
            return MapToDto(item, promotions.GetValueOrDefault(id), now);
        }

        public async Task<PlanResponseDto> CreatePlan(PlanRequest request)
        {
            try
            {
                var newItem = new Plan
                {
                    Plan_id = Guid.NewGuid(),
                    Name = request.Name,
                    Price = request.Price,
                    Duration = request.Duration,
                    Tier = request.Tier > 0 ? request.Tier : PlanTierHelper.DeriveTier(request.Price, request.Duration),
                    Description = request.Description,
                    Features = request.Features,
                    IsDeleted = false
                };

                var result = await _planRepo.CreatePlan(newItem);
                _logger.LogInformation("Plan '{Plan_id}' created successfully", newItem.Plan_id);
                return MapToDto(result, null, DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Plan");
                throw;
            }
        }

        public async Task<PlanResponseDto> UpdatePlan(Guid id, PlanRequest request)
        {
            try
            {
                var existingItem = await _planRepo.GetPlanById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Plan with id {id} not found");

                existingItem.Name = request.Name;
                existingItem.Price = request.Price;
                existingItem.Duration = request.Duration;
                if (request.Tier > 0) existingItem.Tier = request.Tier;
                existingItem.Description = request.Description;
                existingItem.Features = request.Features;

                var result = await _planRepo.UpdatePlan(existingItem);
                _logger.LogInformation("Plan '{Plan_id}' updated successfully", existingItem.Plan_id);

                var now = DateTime.UtcNow;
                var promotions = await _promotionRepo.GetActiveByPlanIdsAsync(new List<Guid> { id }, now);
                return MapToDto(result, promotions.GetValueOrDefault(id), now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Plan '{Plan_id}'", id);
                throw;
            }
        }

        public async Task<PlanResponseDto> SoftDeletePlan(Guid id)
        {
            var result = await _planRepo.SoftDeletePlan(id);
            return MapToDto(result, null, DateTime.UtcNow);
        }

        private PlanResponseDto MapToDto(Plan entity, Promotion? promotion, DateTime nowUtc)
        {
            if (entity == null) return null;
            int effectiveTier = PlanTierHelper.GetEffectiveTier(entity);

            var effectivePrice = PlanPricingHelper.ResolveEffectivePrice(entity.Price, promotion, nowUtc);
            var isOnSale = promotion != null && effectivePrice < entity.Price;

            return new PlanResponseDto
            {
                Plan_id = entity.Plan_id,
                Name = entity.Name,
                Price = entity.Price,
                Duration = entity.Duration,
                Tier = effectiveTier,
                Description = entity.Description,
                Features = entity.Features,
                IsDeleted = entity.IsDeleted,
                EffectivePrice = effectivePrice,
                SalePercent = isOnSale ? promotion!.DiscountPercent : 0,
                PromotionId = isOnSale ? promotion!.Promo_id : null,
                PromotionName = isOnSale ? promotion!.Name : null,
                SaleStartAt = isOnSale ? promotion!.StartAt : null,
                SaleEndAt = isOnSale ? promotion!.EndAt : null,
                IsOnSale = isOnSale
            };
        }
    }
}
