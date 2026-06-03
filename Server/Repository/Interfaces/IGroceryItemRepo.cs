using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IGroceryItemRepo
    {
        Task<List<GroceryItem>> GetAllGroceryItems();
        Task<GroceryItem?> GetGroceryItemById(Guid id);
        Task<GroceryItem> CreateGroceryItem(GroceryItem groceryItem);
        Task<GroceryItem> UpdateGroceryItem(GroceryItem groceryItem);
        Task<GroceryItem> SoftDeleteGroceryItem(Guid id);
    }
}
