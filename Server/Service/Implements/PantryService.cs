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
    public class PantryService : IPantryService
    {
        private readonly IPantryRepo _pantryRepo;
        private readonly ILogger<PantryService> _logger;

        public PantryService(IPantryRepo pantryRepo, ILogger<PantryService> logger)
        {
            _pantryRepo = pantryRepo;
            _logger = logger;
        }

        public async Task<List<PantryResponse>> GetAllPantries()
        {
            var pantries = await _pantryRepo.GetAllPantries();
            return pantries.Select(MapToResponse).ToList();
        }

        public async Task<List<PantryResponse>> GetPantriesByAccountId(Guid accountId)
        {
            var pantries = await _pantryRepo.GetPantriesByAccountId(accountId);
            return pantries.Select(MapToResponse).ToList();
        }

        public async Task<PantryResponse?> GetPantryById(Guid id)
        {
            var pantry = await _pantryRepo.GetPantryById(id);
            if (pantry == null) return null;
            return MapToResponse(pantry);
        }

        public async Task<List<PantryResponse>> GetPantriesByIngredientId(Guid ingredientId)
        {
            var pantries = await _pantryRepo.GetPantriesByIngredientId(ingredientId);
            return pantries.Select(MapToResponse).ToList();
        }

        public async Task<List<PantryResponse>> GetExpiringPantries(Guid accountId, int daysThreshold)
        {
            var thresholdDate = DateTime.UtcNow.AddDays(daysThreshold);
            var pantries = await _pantryRepo.GetExpiringPantries(accountId, thresholdDate);
            return pantries.Select(MapToResponse).ToList();
        }

        public async Task<PantryResponse> CreatePantry(PantryRequest request, Guid accountId)
        {
            try
            {
                if (request.Quantity <= 0)
                    throw new ArgumentException("Quantity must be greater than 0", nameof(request.Quantity));

                if (string.IsNullOrWhiteSpace(request.Unit))
                    throw new ArgumentException("Unit must not be null or empty", nameof(request.Unit));

                if (request.ExpiryDate <= DateTime.UtcNow)
                    throw new ArgumentException("Expiry date must be in the future", nameof(request.ExpiryDate));

                var newPantry = new Pantry
                {
                    Pantry_id = Guid.NewGuid(),
                    Account_id = accountId,
                    Ingredient_id = request.Ingredient_id,
                    Quantity = request.Quantity,
                    Unit = request.Unit,
                    ExpiryDate = DateTime.SpecifyKind(request.ExpiryDate, DateTimeKind.Utc),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var result = await _pantryRepo.CreatePantry(newPantry);
                _logger.LogInformation("Pantry '{PantryId}' created for Account '{AccountId}'", newPantry.Pantry_id, accountId);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating pantry for account '{AccountId}'", accountId);
                throw;
            }
        }

        public async Task<PantryResponse> UpdatePantry(Guid id, PantryUpdateRequest request, Guid accountId)
        {
            try
            {
                if (request.Quantity <= 0)
                    throw new ArgumentException("Quantity must be greater than 0", nameof(request.Quantity));

                if (request.Unit != null && string.IsNullOrWhiteSpace(request.Unit))
                    throw new ArgumentException("Unit must not be empty", nameof(request.Unit));

                var existingPantry = await _pantryRepo.GetPantryById(id);
                if (existingPantry == null)
                    throw new KeyNotFoundException($"Pantry with id {id} not found");

                if (existingPantry.Account_id != accountId)
                    throw new UnauthorizedAccessException("You do not have permission to update this pantry");

                if (request.Ingredient_id.HasValue)
                    existingPantry.Ingredient_id = request.Ingredient_id.Value;
                if (request.Quantity.HasValue)
                    existingPantry.Quantity = request.Quantity.Value;
                if (!string.IsNullOrEmpty(request.Unit))
                    existingPantry.Unit = request.Unit;
                if (request.ExpiryDate.HasValue)
                    existingPantry.ExpiryDate = DateTime.SpecifyKind(request.ExpiryDate.Value, DateTimeKind.Utc);
                existingPantry.UpdatedAt = DateTime.UtcNow;

                var result = await _pantryRepo.UpdatePantry(existingPantry);
                _logger.LogInformation("Pantry '{PantryId}' updated successfully", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating pantry '{PantryId}'", id);
                throw;
            }
        }

        public async Task<PantryResponse> SoftDeletePantry(Guid id, Guid accountId)
        {
            try
            {
                var existingPantry = await _pantryRepo.GetPantryById(id);
                if (existingPantry == null)
                    throw new KeyNotFoundException($"Pantry with id {id} not found");

                if (existingPantry.Account_id != accountId)
                    throw new UnauthorizedAccessException("You do not have permission to delete this pantry");

                var result = await _pantryRepo.SoftDeletePantry(id);
                _logger.LogInformation("Pantry '{PantryId}' soft deleted", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting pantry '{PantryId}'", id);
                throw;
            }
        }

        private PantryResponse MapToResponse(Pantry pantry)
        {
            return new PantryResponse
            {
                Pantry_id = pantry.Pantry_id,
                Account_id = pantry.Account_id,
                Ingredient_id = pantry.Ingredient_id,
                IngredientName = pantry.Ingredient?.Name ?? string.Empty,
                Quantity = pantry.Quantity,
                Unit = pantry.Unit,
                ExpiryDate = pantry.ExpiryDate,
                CreatedAt = pantry.CreatedAt,
                UpdatedAt = pantry.UpdatedAt
            };
        }
    }
}
