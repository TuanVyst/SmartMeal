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
    public class GroceryItemService : IGroceryItemService
    {
        private readonly IGroceryItemRepo _groceryItemRepo;
        private readonly ILogger<GroceryItemService> _logger;

        public GroceryItemService(IGroceryItemRepo groceryItemRepo, ILogger<GroceryItemService> logger)
        {
            _groceryItemRepo = groceryItemRepo;
            _logger = logger;
        }

        public async Task<List<GroceryItemResponseDto>> GetAllGroceryItems()
        {
            var groceryItems = await _groceryItemRepo.GetAllGroceryItems();
            return groceryItems.Select(MapToDto).ToList();
        }

        public async Task<GroceryItemResponseDto?> GetGroceryItemById(Guid id)
        {
            var groceryItem = await _groceryItemRepo.GetGroceryItemById(id);
            return groceryItem == null ? null : MapToDto(groceryItem);
        }

        public async Task<GroceryItemResponseDto> CreateGroceryItem(GroceryItemRequest request)
        {
            try
            {
                var newGroceryItem = new GroceryItem
                {
                    Item_id = Guid.NewGuid(),
                    List_id = request.List_id,
                    Ingredient_id = request.Ingredient_id,
                    Product_id = request.Product_id,
                    Quantity = request.Quantity,
                    Unit = request.Unit,
                    IsPurchased = request.IsPurchased,
                    Field = request.Field,
                    IsDeleted = false
                };

                var result = await _groceryItemRepo.CreateGroceryItem(newGroceryItem);
                _logger.LogInformation("GroceryItem '{Item_id}' created successfully", newGroceryItem.Item_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating GroceryItem");
                throw;
            }
        }

        public async Task<GroceryItemResponseDto> UpdateGroceryItem(Guid id, GroceryItemRequest request)
        {
            try
            {
                var existingItem = await _groceryItemRepo.GetGroceryItemById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"GroceryItem with id {id} not found");

                existingItem.List_id = request.List_id;
                existingItem.Ingredient_id = request.Ingredient_id;
                existingItem.Product_id = request.Product_id;
                existingItem.Quantity = request.Quantity;
                existingItem.Unit = request.Unit;
                existingItem.IsPurchased = request.IsPurchased;
                existingItem.Field = request.Field;

                var result = await _groceryItemRepo.UpdateGroceryItem(existingItem);
                _logger.LogInformation("GroceryItem '{Item_id}' updated successfully", existingItem.Item_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating GroceryItem '{Item_id}'", id);
                throw;
            }
        }

        public async Task<GroceryItemResponseDto> SoftDeleteGroceryItem(Guid id)
        {
            var result = await _groceryItemRepo.SoftDeleteGroceryItem(id);
            return MapToDto(result);
        }
        
        private GroceryItemResponseDto MapToDto(GroceryItem entity)
        {
            if (entity == null) return null;
            return new GroceryItemResponseDto
            {
                Item_id = entity.Item_id,
                List_id = entity.List_id,
                Ingredient_id = entity.Ingredient_id,
                Product_id = entity.Product_id,
                Quantity = entity.Quantity,
                Unit = entity.Unit,
                IsPurchased = entity.IsPurchased,
                Field = entity.Field,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
