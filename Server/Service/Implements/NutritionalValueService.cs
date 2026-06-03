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
    public class NutritionalValueService : INutritionalValueService
    {
        private readonly INutritionalValueRepo _nutritionalValueRepo;
        private readonly ILogger<NutritionalValueService> _logger;

        public NutritionalValueService(INutritionalValueRepo nutritionalValueRepo, ILogger<NutritionalValueService> logger)
        {
            _nutritionalValueRepo = nutritionalValueRepo;
            _logger = logger;
        }

        public async Task<List<NutritionalValueResponseDto>> GetAllNutritionalValues()
        {
            var nutritionalValues = await _nutritionalValueRepo.GetAllNutritionalValues();
            return nutritionalValues.Select(MapToDto).ToList();
        }

        public async Task<NutritionalValueResponseDto?> GetNutritionalValueById(Guid id)
        {
            var nutritionalValue = await _nutritionalValueRepo.GetNutritionalValueById(id);
            return nutritionalValue == null ? null : MapToDto(nutritionalValue);
        }

        public async Task<NutritionalValueResponseDto> CreateNutritionalValue(NutritionalValueRequest request)
        {
            try
            {
                var newNutritionalValue = new NutritionalValue
                {
                    Nv_id = Guid.NewGuid(),
                    Ingredient_id = request.Ingredient_id,
                    Calories = request.Calories,
                    IsDeleted = false
                };

                var result = await _nutritionalValueRepo.CreateNutritionalValue(newNutritionalValue);
                _logger.LogInformation("NutritionalValue '{Nv_id}' created successfully", newNutritionalValue.Nv_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating NutritionalValue");
                throw;
            }
        }

        public async Task<NutritionalValueResponseDto> UpdateNutritionalValue(Guid id, NutritionalValueRequest request)
        {
            try
            {
                var existingItem = await _nutritionalValueRepo.GetNutritionalValueById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"NutritionalValue with id {id} not found");

                existingItem.Ingredient_id = request.Ingredient_id;
                existingItem.Calories = request.Calories;

                var result = await _nutritionalValueRepo.UpdateNutritionalValue(existingItem);
                _logger.LogInformation("NutritionalValue '{Nv_id}' updated successfully", existingItem.Nv_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating NutritionalValue '{Nv_id}'", id);
                throw;
            }
        }

        public async Task<NutritionalValueResponseDto> SoftDeleteNutritionalValue(Guid id)
        {
            var result = await _nutritionalValueRepo.SoftDeleteNutritionalValue(id);
            return MapToDto(result);
        }
        
        private NutritionalValueResponseDto MapToDto(NutritionalValue entity)
        {
            if (entity == null) return null;
            return new NutritionalValueResponseDto
            {
                Nv_id = entity.Nv_id,
                Ingredient_id = entity.Ingredient_id,
                Calories = entity.Calories,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
