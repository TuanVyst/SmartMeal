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

        public async Task<List<AllergyResponseDto>> GetAllAllergies(CancellationToken cancellationToken = default)
        {
            var items = await _allergyRepo.GetAllAllergies(cancellationToken);
            return items.Select(MapToDto).ToList();
        }

        public async Task<List<AllergyResponseDto>> GetAllergiesByAccountId(Guid accountId, CancellationToken cancellationToken = default)
        {
            var items = await _allergyRepo.GetAllergiesByAccountId(accountId, cancellationToken);
            return items.Select(MapToDto).ToList();
        }

        public async Task<AllergyResponseDto?> GetAllergyById(Guid id, CancellationToken cancellationToken = default)
        {
            var item = await _allergyRepo.GetAllergyById(id, cancellationToken);
            return item == null ? null : MapToDto(item);
        }

        public async Task<AllergyResponseDto> CreateAllergy(AllergyRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                // Check if allergy record already exists for this account and ingredient
                var existingItem = await _allergyRepo.GetAllergyByAccountAndIngredient(request.Account_id, request.Ingredient_id, cancellationToken);
                if (existingItem != null)
                {
                    if (existingItem.IsDeleted)
                    {
                        existingItem.IsDeleted = false;
                        var updated = await _allergyRepo.UpdateAllergy(existingItem, cancellationToken);
                        _logger.LogInformation("Allergy '{Allergy_id}' restored successfully", updated.Allergy_id);
                        return MapToDto(updated);
                    }
                    // Already active, return existing to avoid duplicate entries
                    return MapToDto(existingItem);
                }

                var newItem = new Allergy
                {
                    Allergy_id = Guid.NewGuid(),
                    Ingredient_id = request.Ingredient_id,
                    Account_id = request.Account_id,
                    IsDeleted = false
                };

                var result = await _allergyRepo.CreateAllergy(newItem, cancellationToken);
                _logger.LogInformation("Allergy '{Allergy_id}' created successfully", newItem.Allergy_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Allergy");
                throw;
            }
        }

        public async Task<AllergyResponseDto> UpdateAllergy(Guid id, AllergyRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var existingItem = await _allergyRepo.GetAllergyById(id, cancellationToken);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Allergy with id {id} not found");

                existingItem.Ingredient_id = request.Ingredient_id;
                existingItem.Account_id = request.Account_id;

                var result = await _allergyRepo.UpdateAllergy(existingItem, cancellationToken);
                _logger.LogInformation("Allergy '{Allergy_id}' updated successfully", existingItem.Allergy_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Allergy '{Allergy_id}'", id);
                throw;
            }
        }

        public async Task<AllergyResponseDto> SoftDeleteAllergy(Guid id, CancellationToken cancellationToken = default)
        {
            var result = await _allergyRepo.SoftDeleteAllergy(id, cancellationToken);
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
