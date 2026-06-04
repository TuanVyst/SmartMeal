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
        Task<GroceryList> CreateGroceryList(GroceryList groceryList);
        Task<GroceryList> UpdateGroceryList(GroceryList groceryList);
        Task<GroceryList> SoftDeleteGroceryList(Guid id);
    }
}
