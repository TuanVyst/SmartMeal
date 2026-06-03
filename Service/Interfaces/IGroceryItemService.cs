using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IGroceryItemService
    {
        Task<List<GroceryItemResponseDto>> GetAllGroceryItems();
        Task<GroceryItemResponseDto?> GetGroceryItemById(Guid id);
        Task<GroceryItemResponseDto> CreateGroceryItem(GroceryItemRequest groceryItem);
        Task<GroceryItemResponseDto> UpdateGroceryItem(Guid id, GroceryItemRequest groceryItem);
        Task<GroceryItemResponseDto> SoftDeleteGroceryItem(Guid id);
    }
}
