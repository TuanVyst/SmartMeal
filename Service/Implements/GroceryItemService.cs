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
    public class GroceryItemService : IGroceryItemService
    {
        private readonly IGroceryItemRepo _groceryItemRepo;
        private readonly IGroceryListRepo _groceryListRepo;
        private readonly ILogger<GroceryItemService> _logger;

        public GroceryItemService(IGroceryItemRepo groceryItemRepo, IGroceryListRepo groceryListRepo, ILogger<GroceryItemService> logger)
        {
            _groceryItemRepo = groceryItemRepo;
            _groceryListRepo = groceryListRepo;
            _logger = logger;
        }

        public async Task<List<GroceryItemResponse>> GetAllGroceryItems()
        {
            var items = await _groceryItemRepo.GetAllGroceryItems();
            return items.Select(MapToResponse).ToList();
        }

        public async Task<GroceryItemResponse?> GetGroceryItemById(Guid id)
        {
            var item = await _groceryItemRepo.GetGroceryItemById(id);
            if (item == null) return null;
            return MapToResponse(item);
        }

        public async Task<List<GroceryItemResponse>> GetGroceryItemsByListId(Guid listId)
        {
            var items = await _groceryItemRepo.GetGroceryItemsByListId(listId);
            return items.Select(MapToResponse).ToList();
        }

        public async Task<GroceryItemResponse> CreateGroceryItem(GroceryItemRequest request)
        {
            try
            {
                if (request.Quantity <= 0)
                    throw new ArgumentException("Quantity must be greater than 0", nameof(request.Quantity));

                var groceryList = await _groceryListRepo.GetGroceryListById(request.List_id);
                if (groceryList == null)
                    throw new KeyNotFoundException($"GroceryList with id {request.List_id} not found");

                var newItem = new GroceryItem
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

                var result = await _groceryItemRepo.CreateGroceryItem(newItem);
                _logger.LogInformation("GroceryItem '{ItemId}' created for List '{ListId}'", newItem.Item_id, request.List_id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating grocery item for list '{ListId}'", request.List_id);
                throw;
            }
        }

        public async Task<GroceryItemResponse> UpdateGroceryItem(Guid id, GroceryItemUpdateRequest request)
        {
            try
            {
                if (request.Quantity <= 0)
                    throw new ArgumentException("Quantity must be greater than 0", nameof(request.Quantity));

                var existingItem = await _groceryItemRepo.GetGroceryItemById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"GroceryItem with id {id} not found");

                if (request.Ingredient_id.HasValue)
                    existingItem.Ingredient_id = request.Ingredient_id.Value;
                if (request.Product_id.HasValue)
                    existingItem.Product_id = request.Product_id.Value;
                if (request.Quantity.HasValue)
                    existingItem.Quantity = request.Quantity.Value;
                if (!string.IsNullOrEmpty(request.Unit))
                    existingItem.Unit = request.Unit;
                if (request.IsPurchased.HasValue)
                    existingItem.IsPurchased = request.IsPurchased.Value;
                if (!string.IsNullOrEmpty(request.Field))
                    existingItem.Field = request.Field;

                var result = await _groceryItemRepo.UpdateGroceryItem(existingItem);
                _logger.LogInformation("GroceryItem '{ItemId}' updated successfully", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating grocery item '{ItemId}'", id);
                throw;
            }
        }

        public async Task<GroceryItemResponse> SoftDeleteGroceryItem(Guid id)
        {
            try
            {
                var existingItem = await _groceryItemRepo.GetGroceryItemById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"GroceryItem with id {id} not found");

                var result = await _groceryItemRepo.SoftDeleteGroceryItem(id);
                _logger.LogInformation("GroceryItem '{ItemId}' soft deleted", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting grocery item '{ItemId}'", id);
                throw;
            }
        }

        private GroceryItemResponse MapToResponse(GroceryItem item)
        {
            return new GroceryItemResponse
            {
                Item_id = item.Item_id,
                List_id = item.List_id,
                Ingredient_id = item.Ingredient_id,
                IngredientName = item.Ingredient?.Name ?? string.Empty,
                Product_id = item.Product_id,
                ProductName = item.AffiliateProduct?.Name ?? string.Empty,
                Quantity = item.Quantity,
                Unit = item.Unit,
                IsPurchased = item.IsPurchased,
                Field = item.Field
            };
        }
    }
}
