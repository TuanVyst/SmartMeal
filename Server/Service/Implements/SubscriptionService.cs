using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
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
        private readonly ILogger<SubscriptionService> _logger;

        public SubscriptionService(ISubscriptionRepo subscriptionRepo, ILogger<SubscriptionService> logger)
        {
            _subscriptionRepo = subscriptionRepo;
            _logger = logger;
        }

        public async Task<List<SubscriptionResponseDto>> GetAllSubscriptions()
        {
            var items = await _subscriptionRepo.GetAllSubscriptions();
            return items.Select(MapToDto).ToList();
        }

        public async Task<SubscriptionResponseDto?> GetSubscriptionById(Guid id)
        {
            var item = await _subscriptionRepo.GetSubscriptionById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<SubscriptionResponseDto> CreateSubscription(SubscriptionRequest request)
        {
            try
            {
                var newItem = new Subscription
                {
                    Sub_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
                    Plan_id = request.Plan_id,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    Status = request.Status,
                    IsDeleted = false
                };

                var result = await _subscriptionRepo.CreateSubscription(newItem);
                _logger.LogInformation("Subscription '{Sub_id}' created successfully", newItem.Sub_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Subscription");
                throw;
            }
        }

        public async Task<SubscriptionResponseDto> UpdateSubscription(Guid id, SubscriptionRequest request)
        {
            try
            {
                var existingItem = await _subscriptionRepo.GetSubscriptionById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Subscription with id {id} not found");

                existingItem.Account_id = request.Account_id;
                existingItem.Plan_id = request.Plan_id;
                existingItem.StartDate = request.StartDate;
                existingItem.EndDate = request.EndDate;
                existingItem.Status = request.Status;

                var result = await _subscriptionRepo.UpdateSubscription(existingItem);
                _logger.LogInformation("Subscription '{Sub_id}' updated successfully", existingItem.Sub_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Subscription '{Sub_id}'", id);
                throw;
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
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
