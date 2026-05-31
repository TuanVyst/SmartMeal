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
    public class GroceryListService : IGroceryListService
    {
        private readonly IGroceryListRepo _groceryListRepo;
        private readonly ILogger<GroceryListService> _logger;

        public GroceryListService(IGroceryListRepo groceryListRepo, ILogger<GroceryListService> logger)
        {
            _groceryListRepo = groceryListRepo;
            _logger = logger;
        }

        public async Task<List<GroceryListResponse>> GetAllGroceryLists()
        {
            var lists = await _groceryListRepo.GetAllGroceryLists();
            return lists.Select(MapToResponse).ToList();
        }

        public async Task<GroceryListResponse?> GetGroceryListById(Guid id)
        {
            var list = await _groceryListRepo.GetGroceryListById(id);
            if (list == null) return null;
            return MapToResponse(list);
        }

        public async Task<List<GroceryListResponse>> GetGroceryListsByAccountId(Guid accountId)
        {
            var lists = await _groceryListRepo.GetGroceryListsByAccountId(accountId);
            return lists.Select(MapToResponse).ToList();
        }

        public async Task<GroceryListResponse> CreateGroceryList(GroceryListRequest request, Guid accountId)
        {
            try
            {
                var newList = new GroceryList
                {
                    List_id = Guid.NewGuid(),
                    Account_id = accountId,
                    Status = request.Status ?? "Active",
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var result = await _groceryListRepo.CreateGroceryList(newList);
                _logger.LogInformation("GroceryList '{ListId}' created for Account '{AccountId}'", newList.List_id, accountId);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating grocery list for account '{AccountId}'", accountId);
                throw;
            }
        }

        public async Task<GroceryListResponse> UpdateGroceryList(Guid id, GroceryListUpdateRequest request, Guid accountId)
        {
            try
            {
                var existingList = await _groceryListRepo.GetGroceryListById(id);
                if (existingList == null)
                    throw new KeyNotFoundException($"GroceryList with id {id} not found");

                if (existingList.Account_id != accountId)
                    throw new UnauthorizedAccessException("You do not have permission to update this grocery list");

                existingList.Status = request.Status ?? existingList.Status;

                var result = await _groceryListRepo.UpdateGroceryList(existingList);
                _logger.LogInformation("GroceryList '{ListId}' updated successfully", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating grocery list '{ListId}'", id);
                throw;
            }
        }

        public async Task<GroceryListResponse> SoftDeleteGroceryList(Guid id, Guid accountId)
        {
            try
            {
                var existingList = await _groceryListRepo.GetGroceryListById(id);
                if (existingList == null)
                    throw new KeyNotFoundException($"GroceryList with id {id} not found");

                if (existingList.Account_id != accountId)
                    throw new UnauthorizedAccessException("You do not have permission to delete this grocery list");

                var result = await _groceryListRepo.SoftDeleteGroceryList(id);
                _logger.LogInformation("GroceryList '{ListId}' soft deleted", id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting grocery list '{ListId}'", id);
                throw;
            }
        }

        private GroceryListResponse MapToResponse(GroceryList list)
        {
            return new GroceryListResponse
            {
                List_id = list.List_id,
                Account_id = list.Account_id,
                CreatedAt = list.CreatedAt,
                Status = list.Status,
                Items = list.GroceryItems?.Select(item => new GroceryItemResponse
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
                }).ToList() ?? new List<GroceryItemResponse>()
            };
        }
    }
}
