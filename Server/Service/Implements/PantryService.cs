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
    public class PantryService : IPantryService
    {
        private readonly IPantryRepo _pantryRepo;
        private readonly ILogger<PantryService> _logger;

        public PantryService(IPantryRepo pantryRepo, ILogger<PantryService> logger)
        {
            _pantryRepo = pantryRepo;
            _logger = logger;
        }

        public async Task<List<PantryResponseDto>> GetAllPantries()
        {
            var pantries = await _pantryRepo.GetAllPantries();
            return pantries.Select(MapToDto).ToList();
        }

        public async Task<PantryResponseDto?> GetPantryById(Guid id)
        {
            var pantry = await _pantryRepo.GetPantryById(id);
            return pantry == null ? null : MapToDto(pantry);
        }

        public async Task<PantryResponseDto> CreatePantry(PantryRequest request)
        {
            try
            {
                var newPantry = new Pantry
                {
                    Pantry_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
                    Ingredient_id = request.Ingredient_id,
                    Quantity = request.Quantity,
                    Unit = request.Unit,
                    ExpiryDate = request.ExpiryDate,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var result = await _pantryRepo.CreatePantry(newPantry);
                _logger.LogInformation("Pantry '{Pantry_id}' created successfully", newPantry.Pantry_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Pantry");
                throw;
            }
        }

        public async Task<PantryResponseDto> UpdatePantry(Guid id, PantryRequest request)
        {
            try
            {
                var existingItem = await _pantryRepo.GetPantryById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Pantry with id {id} not found");

                existingItem.Account_id = request.Account_id;
                existingItem.Ingredient_id = request.Ingredient_id;
                existingItem.Quantity = request.Quantity;
                existingItem.Unit = request.Unit;
                existingItem.ExpiryDate = request.ExpiryDate;
                existingItem.UpdatedAt = DateTime.UtcNow;

                var result = await _pantryRepo.UpdatePantry(existingItem);
                _logger.LogInformation("Pantry '{Pantry_id}' updated successfully", existingItem.Pantry_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Pantry '{Pantry_id}'", id);
                throw;
            }
        }

        public async Task<PantryResponseDto> SoftDeletePantry(Guid id)
        {
            var result = await _pantryRepo.SoftDeletePantry(id);
            return MapToDto(result);
        }
        
        private PantryResponseDto MapToDto(Pantry entity)
        {
            if (entity == null) return null;
            return new PantryResponseDto
            {
                Pantry_id = entity.Pantry_id,
                Account_id = entity.Account_id,
                Ingredient_id = entity.Ingredient_id,
                Quantity = entity.Quantity,
                Unit = entity.Unit,
                ExpiryDate = entity.ExpiryDate,
                AddedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
