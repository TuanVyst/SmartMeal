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
    public class GroceryListService : IGroceryListService
    {
        private readonly IGroceryListRepo _groceryListRepo;
        private readonly ILogger<GroceryListService> _logger;

        public GroceryListService(IGroceryListRepo groceryListRepo, ILogger<GroceryListService> logger)
        {
            _groceryListRepo = groceryListRepo;
            _logger = logger;
        }

        public async Task<List<GroceryListResponseDto>> GetAllGroceryLists()
        {
            var groceryLists = await _groceryListRepo.GetAllGroceryLists();
            return groceryLists.Select(MapToDto).ToList();
        }

        public async Task<GroceryListResponseDto?> GetGroceryListById(Guid id)
        {
            var groceryList = await _groceryListRepo.GetGroceryListById(id);
            return groceryList == null ? null : MapToDto(groceryList);
        }

        public async Task<GroceryListResponseDto> CreateGroceryList(GroceryListRequest request)
        {
            try
            {
                var newGroceryList = new GroceryList
                {
                    List_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
                    CreatedAt = DateTime.UtcNow,
                    Status = request.Status,
                    IsDeleted = false
                };

                var result = await _groceryListRepo.CreateGroceryList(newGroceryList);
                _logger.LogInformation("GroceryList '{List_id}' created successfully", newGroceryList.List_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating GroceryList");
                throw;
            }
        }

        public async Task<GroceryListResponseDto> UpdateGroceryList(Guid id, GroceryListRequest request)
        {
            try
            {
                var existingItem = await _groceryListRepo.GetGroceryListById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"GroceryList with id {id} not found");

                existingItem.Account_id = request.Account_id;
                existingItem.Status = request.Status;

                var result = await _groceryListRepo.UpdateGroceryList(existingItem);
                _logger.LogInformation("GroceryList '{List_id}' updated successfully", existingItem.List_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating GroceryList '{List_id}'", id);
                throw;
            }
        }

        public async Task<GroceryListResponseDto> SoftDeleteGroceryList(Guid id)
        {
            var result = await _groceryListRepo.SoftDeleteGroceryList(id);
            return MapToDto(result);
        }
        
        private GroceryListResponseDto MapToDto(GroceryList entity)
        {
            if (entity == null) return null;
            return new GroceryListResponseDto
            {
                List_id = entity.List_id,
                Account_id = entity.Account_id,
                CreatedAt = entity.CreatedAt,
                Status = entity.Status,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
