using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ISubscriptionRepo _subscriptionRepo;
        private readonly IPlanRepo _planRepo;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SubscriptionService> _logger;

        public SubscriptionService(
            ISubscriptionRepo subscriptionRepo,
            IPlanRepo planRepo,
            IConfiguration configuration,
            ILogger<SubscriptionService> logger)
        {
            _subscriptionRepo = subscriptionRepo;
            _planRepo = planRepo;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<List<SubscriptionResponseDto>> GetAllSubscriptions()
        {
            var items = await _subscriptionRepo.GetAllSubscriptions();
            return items.Select(MapToDto).ToList();
        }

        public async Task<List<SubscriptionResponseDto>> GetSubscriptionsByAccountId(Guid accountId)
        {
            var items = await _subscriptionRepo.GetSubscriptionsByAccountId(accountId);
            var dtos = items.Select(MapToDto).ToList();

            if (_configuration.GetValue<bool>("FeatureFlags:BypassPremium", false))
            {
                var now = DateTime.UtcNow;
                bool hasActive = items.Any(s => s.Status == "active" && (!s.EndDate.HasValue || s.EndDate.Value > now));
                if (!hasActive)
                {
                    var plans = await _planRepo.GetAllPlans();
                    var proPlan = plans.FirstOrDefault(p => p.Features != null && p.Features.Contains("meal_plan"))
                                  ?? plans.OrderByDescending(p => p.Price).FirstOrDefault();

                    dtos.Insert(0, new SubscriptionResponseDto
                    {
                        Sub_id = Guid.NewGuid(),
                        Account_id = accountId,
                        Plan_id = proPlan?.Plan_id ?? Guid.Empty,
                        StartDate = now,
                        EndDate = now.AddYears(1),
                        Status = "active",
                        PaymentRef = "TRIAL_BYPASS",
                        PricePaid = 0,
                        IsDeleted = false
                    });
                }
            }

            return dtos;
        }

        public async Task<SubscriptionResponseDto?> GetSubscriptionById(Guid id)
        {
            var item = await _subscriptionRepo.GetSubscriptionById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<SubscriptionResponseDto> CreateSubscription(SubscriptionRequest request)
        {
            var plan = await _planRepo.GetPlanById(request.Plan_id);
            if (plan == null)
                throw new InvalidOperationException("Plan not found");

            var startDate = request.StartDate == default ? DateTime.UtcNow : request.StartDate;
            DateTime? endDate = null;
            if (plan.Duration > 0)
                endDate = startDate.AddDays(plan.Duration);

            var newItem = new Subscription
            {
                Sub_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                Plan_id = request.Plan_id,
                StartDate = startDate,
                EndDate = endDate,
                Status = request.Status,
                PaymentRef = request.PaymentRef,
                PricePaid = request.PricePaid > 0 ? request.PricePaid : plan.Price,
                IsDeleted = false
            };

            var result = await _subscriptionRepo.CreateSubscription(newItem);
            _logger.LogInformation("Subscription '{Sub_id}' created successfully", newItem.Sub_id);
            return MapToDto(result);
        }

        public async Task<SubscriptionResponseDto> UpdateSubscription(Guid id, SubscriptionRequest request)
        {
            var existingItem = await _subscriptionRepo.GetSubscriptionById(id);
            if (existingItem == null)
                throw new KeyNotFoundException($"Subscription with id {id} not found");

            var plan = await _planRepo.GetPlanById(request.Plan_id);
            if (plan == null)
                throw new InvalidOperationException("Plan not found");

            var startDate = request.StartDate == default ? existingItem.StartDate : request.StartDate;
            DateTime? endDate = null;
            if (plan.Duration > 0)
                endDate = startDate.AddDays(plan.Duration);

            existingItem.Plan_id = request.Plan_id;
            existingItem.StartDate = startDate;
            existingItem.EndDate = endDate;
            existingItem.Status = request.Status;
            existingItem.PaymentRef = request.PaymentRef;
            if (request.PricePaid > 0) existingItem.PricePaid = request.PricePaid;

            var result = await _subscriptionRepo.UpdateSubscription(existingItem);
            _logger.LogInformation("Subscription '{Sub_id}' updated successfully", existingItem.Sub_id);
            return MapToDto(result);
        }

        public async Task<bool> HasFeatureAsync(Guid accountId, string featureKey)
        {
            if (_configuration.GetValue<bool>("FeatureFlags:BypassPremium", false))
            {
                return true;
            }

            var subs = await _subscriptionRepo.GetSubscriptionsByAccountId(accountId);
            var activeSub = subs.FirstOrDefault(s => s.Status == "active" && (!s.EndDate.HasValue || s.EndDate.Value > DateTime.UtcNow));
            if (activeSub == null) return false;

            var plan = await _planRepo.GetPlanById(activeSub.Plan_id);
            if (plan == null || string.IsNullOrEmpty(plan.Features)) return false;

            try
            {
                var features = System.Text.Json.JsonSerializer.Deserialize<List<string>>(plan.Features);
                return features != null && features.Contains(featureKey);
            }
            catch
            {
                // In case the Features string is not a valid JSON array
                return false;
            }
        }

        public async Task<SubscriptionResponseDto> SoftDeleteSubscription(Guid id)
        {
            var result = await _subscriptionRepo.SoftDeleteSubscription(id);
            return MapToDto(result);
        }

        private SubscriptionResponseDto MapToDto(Subscription entity)
        {
            if (entity == null) return null;
            return new SubscriptionResponseDto
            {
                Sub_id = entity.Sub_id,
                Account_id = entity.Account_id,
                Plan_id = entity.Plan_id,
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                Status = entity.Status,
                PaymentRef = entity.PaymentRef,
                PricePaid = entity.PricePaid,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
