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
                .Include(g => g.GroceryList)
                .Include(g => g.Ingredient)
                .Include(g => g.AffiliateProduct)
                .Where(g => g.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<GroceryItem?> GetGroceryItemById(Guid id)
            => await _ctx.GroceryItems
                .Include(g => g.GroceryList)
                .Include(g => g.Ingredient)
                .Include(g => g.AffiliateProduct)
                .Where(g => !g.IsDeleted)
                .FirstOrDefaultAsync(g => g.Item_id == id);

        public async Task<List<GroceryItem>> GetGroceryItemsByListId(Guid listId)
            => await _ctx.GroceryItems
                .Include(g => g.GroceryList)
                .Include(g => g.Ingredient)
                .Include(g => g.AffiliateProduct)
                .Where(g => g.List_id == listId && g.IsDeleted == false)
                .ToListAsync();

        public async Task<GroceryItem> CreateGroceryItem(GroceryItem item)
        {
            _ctx.GroceryItems.Add(item);
            await _ctx.SaveChangesAsync();
            return item;
        }

        public async Task<GroceryItem> UpdateGroceryItem(GroceryItem item)
        {
            _ctx.GroceryItems.Update(item);
            await _ctx.SaveChangesAsync();
            return item;
        }

        public async Task<GroceryItem> SoftDeleteGroceryItem(Guid id)
        {
            var existingItem = await _ctx.GroceryItems
                .Where(g => g.IsDeleted == false && g.Item_id == id)
                .FirstOrDefaultAsync();
            if (existingItem == null)
                throw new KeyNotFoundException($"GroceryItem with id {id} not found");
            existingItem.IsDeleted = true;
            _ctx.GroceryItems.Update(existingItem);
            await _ctx.SaveChangesAsync();
            return existingItem;
        }
    }
}
