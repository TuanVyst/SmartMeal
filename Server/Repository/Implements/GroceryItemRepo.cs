using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class GroceryItemRepo : IGroceryItemRepo
    {
        private readonly AppDbContext _ctx;
        public GroceryItemRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<GroceryItem>> GetAllGroceryItems()
        {
            return await _ctx.GroceryItems
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<GroceryItem?> GetGroceryItemById(Guid id)
            => await _ctx.GroceryItems
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Item_id == id);

        public async Task<GroceryItem> CreateGroceryItem(GroceryItem groceryItem)
        {
            _ctx.GroceryItems.Add(groceryItem);
            await _ctx.SaveChangesAsync();
            return groceryItem;
        }

        public async Task<GroceryItem> UpdateGroceryItem(GroceryItem groceryItem)
        {
            _ctx.GroceryItems.Update(groceryItem);
            await _ctx.SaveChangesAsync();
            return groceryItem;
        }

        public async Task<GroceryItem> SoftDeleteGroceryItem(Guid id)
        {
            var groceryItem = _ctx.GroceryItems.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Item_id == id);
            if (groceryItem == null)
                throw new Exception("GroceryItem not found");
            groceryItem.IsDeleted = true;
            _ctx.GroceryItems.Update(groceryItem);
            await _ctx.SaveChangesAsync();
            return groceryItem;
        }
    }
}
