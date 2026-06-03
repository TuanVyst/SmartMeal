using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IGroceryListService
    {
        Task<List<GroceryListResponseDto>> GetAllGroceryLists();
        Task<GroceryListResponseDto?> GetGroceryListById(Guid id);
        Task<GroceryListResponseDto> CreateGroceryList(GroceryListRequest groceryList);
        Task<GroceryListResponseDto> UpdateGroceryList(Guid id, GroceryListRequest groceryList);
        Task<GroceryListResponseDto> SoftDeleteGroceryList(Guid id);
    }
}
