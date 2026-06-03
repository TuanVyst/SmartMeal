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
        Task<List<GroceryItem>> GetGroceryItemsByListId(Guid listId);
        Task<GroceryItem> CreateGroceryItem(GroceryItem item);
        Task<GroceryItem> UpdateGroceryItem(GroceryItem item);
        Task<GroceryItem> SoftDeleteGroceryItem(Guid id);
    }
}
