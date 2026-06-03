using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IGroceryListService
    {
        Task<List<GroceryListResponse>> GetAllGroceryLists();
        Task<GroceryListResponse?> GetGroceryListById(Guid id);
        Task<List<GroceryListResponse>> GetGroceryListsByAccountId(Guid accountId);
        Task<GroceryListResponse> CreateGroceryList(GroceryListRequest request, Guid accountId);
        Task<GroceryListResponse> UpdateGroceryList(Guid id, GroceryListUpdateRequest request, Guid accountId);
        Task<GroceryListResponse> SoftDeleteGroceryList(Guid id, Guid accountId);
    }
}
