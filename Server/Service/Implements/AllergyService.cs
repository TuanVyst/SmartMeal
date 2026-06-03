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
    public class AllergyService : IAllergyService
    {
        private readonly IAllergyRepo _allergyRepo;
        private readonly ILogger<AllergyService> _logger;

        public AllergyService(IAllergyRepo allergyRepo, ILogger<AllergyService> logger)
        {
            _allergyRepo = allergyRepo;
            _logger = logger;
        }

        public async Task<List<AllergyResponseDto>> GetAllAllergies()
        {
            var items = await _allergyRepo.GetAllAllergies();
            return items.Select(MapToDto).ToList();
        }

        public async Task<AllergyResponseDto?> GetAllergyById(Guid id)
        {
            var item = await _allergyRepo.GetAllergyById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<AllergyResponseDto> CreateAllergy(AllergyRequest request)
        {
            try
            {
                var newItem = new Allergy
                {
                    Allergy_id = Guid.NewGuid(),
                    Ingredient_id = request.Ingredient_id,
                    Account_id = request.Account_id,
                    IsDeleted = false
                };

                var result = await _allergyRepo.CreateAllergy(newItem);
                _logger.LogInformation("Allergy '{Allergy_id}' created successfully", newItem.Allergy_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Allergy");
                throw;
            }
        }

        public async Task<AllergyResponseDto> UpdateAllergy(Guid id, AllergyRequest request)
        {
            try
            {
                var existingItem = await _allergyRepo.GetAllergyById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Allergy with id {id} not found");

                existingItem.Ingredient_id = request.Ingredient_id;
                existingItem.Account_id = request.Account_id;

                var result = await _allergyRepo.UpdateAllergy(existingItem);
                _logger.LogInformation("Allergy '{Allergy_id}' updated successfully", existingItem.Allergy_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Allergy '{Allergy_id}'", id);
                throw;
            }
        }

        public async Task<AllergyResponseDto> SoftDeleteAllergy(Guid id)
        {
            var result = await _allergyRepo.SoftDeleteAllergy(id);
            return MapToDto(result);
        }
        
        private AllergyResponseDto MapToDto(Allergy entity)
        {
            if (entity == null) return null;
            return new AllergyResponseDto
            {
                Allergy_id = entity.Allergy_id,
                Ingredient_id = entity.Ingredient_id,
                Account_id = entity.Account_id,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
