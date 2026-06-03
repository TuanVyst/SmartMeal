using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IGroceryListRepo
    {
        Task<List<GroceryList>> GetAllGroceryLists();
        Task<GroceryList?> GetGroceryListById(Guid id);
        Task<List<GroceryList>> GetGroceryListsByAccountId(Guid accountId);
        Task<GroceryList> CreateGroceryList(GroceryList list);
        Task<GroceryList> UpdateGroceryList(GroceryList list);
        Task<GroceryList> SoftDeleteGroceryList(Guid id);
    }
}
