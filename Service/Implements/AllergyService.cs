using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Microsoft.Extensions.Logging;
using Repository.Interfaces;
using Service.Interfaces;
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

        public async Task<List<AllergyResponse>> GetAllAllergies()
        {
            var allergies = await _allergyRepo.GetAllAllergies();
            return allergies.Select(MapToResponse).ToList();
        }

        public async Task<AllergyResponse?> GetAllergyById(Guid id)
        {
            var allergy = await _allergyRepo.GetAllergyById(id);
            if (allergy == null) return null;
            return MapToResponse(allergy);
        }

        public async Task<List<AllergyResponse>> GetAllergiesByAccountId(Guid accountId)
        {
            var allergies = await _allergyRepo.GetAllergiesByAccountId(accountId);
            return allergies.Select(MapToResponse).ToList();
        }

        public async Task<AllergyResponse> CreateAllergy(AllergyRequest request, Guid accountId)
        {
            try
            {
                var existingAllergy = await _allergyRepo.GetAllergyByAccountAndIngredient(accountId, request.Ingredient_id);
                if (existingAllergy != null)
                    throw new InvalidOperationException("You already have this allergy recorded");

                var newAllergy = new Allergy
                {
                    Allergy_id = Guid.NewGuid(),
                    Account_id = accountId,
                    Ingredient_id = request.Ingredient_id,
                    IsDeleted = false
                };

                var result = await _allergyRepo.CreateAllergy(newAllergy);
                _logger.LogInformation("Allergy '{AllergyId}' created for Account '{AccountId}'", newAllergy.Allergy_id, accountId);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating allergy for account '{AccountId}'", accountId);
                throw;
            }
        }

        public async Task<AllergyResponse> UpdateAllergy(Guid id, AllergyRequest request, Guid accountId)
        {
            try
            {
                var existingAllergy = await _allergyRepo.GetAllergyById(id);
                if (existingAllergy == null)
                    throw new KeyNotFoundException($"Allergy with id {id} not found");

                if (existingAllergy.Account_id != accountId)
                    throw new UnauthorizedAccessException("You do not have permission to update this allergy");

                existingAllergy.Ingredient_id = request.Ingredient_id;

                var result = await _allergyRepo.UpdateAllergy(existingAllergy);
                _logger.LogInformation("Allergy '{AllergyId}' updated successfully", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating allergy '{AllergyId}'", id);
                throw;
            }
        }

        public async Task<AllergyResponse> SoftDeleteAllergy(Guid id, Guid accountId)
        {
            try
            {
                var existingAllergy = await _allergyRepo.GetAllergyById(id);
                if (existingAllergy == null)
                    throw new KeyNotFoundException($"Allergy with id {id} not found");

                if (existingAllergy.Account_id != accountId)
                    throw new UnauthorizedAccessException("You do not have permission to delete this allergy");

                var result = await _allergyRepo.SoftDeleteAllergy(id);
                _logger.LogInformation("Allergy '{AllergyId}' soft deleted", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting allergy '{AllergyId}'", id);
                throw;
            }
        }

        private AllergyResponse MapToResponse(Allergy allergy)
        {
            return new AllergyResponse
            {
                Allergy_id = allergy.Allergy_id,
                Account_id = allergy.Account_id,
                Ingredient_id = allergy.Ingredient_id,
                IngredientName = allergy.Ingredient?.Name ?? string.Empty
            };
        }
    }
}
