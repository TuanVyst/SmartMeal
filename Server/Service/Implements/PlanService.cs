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
    public class PlanService : IPlanService
    {
        private readonly IPlanRepo _planRepo;
        private readonly ILogger<PlanService> _logger;

        public PlanService(IPlanRepo planRepo, ILogger<PlanService> logger)
        {
            _planRepo = planRepo;
            _logger = logger;
        }

        public async Task<List<PlanResponseDto>> GetAllPlans()
        {
            var items = await _planRepo.GetAllPlans();
            return items.Select(MapToDto).ToList();
        }

        public async Task<PlanResponseDto?> GetPlanById(Guid id)
        {
            var item = await _planRepo.GetPlanById(id);
            return item == null ? null : MapToDto(item);
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
                    Description = request.Description,
                    Features = request.Features,
                    IsDeleted = false
                };

                var result = await _planRepo.CreatePlan(newItem);
                _logger.LogInformation("Plan '{Plan_id}' created successfully", newItem.Plan_id);
                return MapToDto(result);
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
                existingItem.Description = request.Description;
                existingItem.Features = request.Features;

                var result = await _planRepo.UpdatePlan(existingItem);
                _logger.LogInformation("Plan '{Plan_id}' updated successfully", existingItem.Plan_id);
                return MapToDto(result);
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
            return MapToDto(result);
        }
        
        private PlanResponseDto MapToDto(Plan entity)
        {
            if (entity == null) return null;
            return new PlanResponseDto
            {
                Plan_id = entity.Plan_id,
                Name = entity.Name,
                Price = entity.Price,
                Duration = entity.Duration,
                Description = entity.Description,
                Features = entity.Features,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
