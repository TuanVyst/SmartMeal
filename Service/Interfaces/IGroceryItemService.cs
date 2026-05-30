using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IGroceryItemService
    {
        Task<List<GroceryItemResponse>> GetAllGroceryItems();
        Task<GroceryItemResponse?> GetGroceryItemById(Guid id);
        Task<List<GroceryItemResponse>> GetGroceryItemsByListId(Guid listId);
        Task<GroceryItemResponse> CreateGroceryItem(GroceryItemRequest request, Guid accountId);
        Task<GroceryItemResponse> UpdateGroceryItem(Guid id, GroceryItemUpdateRequest request, Guid accountId);
        Task<GroceryItemResponse> SoftDeleteGroceryItem(Guid id, Guid accountId);
    }
}
