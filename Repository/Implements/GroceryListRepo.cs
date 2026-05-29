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
    public class GroceryListRepo : IGroceryListRepo
    {
        private readonly AppDbContext _ctx;
        public GroceryListRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<GroceryList>> GetAllGroceryLists()
        {
            return await _ctx.GroceryLists
                .Include(g => g.GroceryItems)
                .Where(g => g.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<GroceryList?> GetGroceryListById(Guid id)
            => await _ctx.GroceryLists
                .Include(g => g.GroceryItems)
                .Where(g => !g.IsDeleted)
                .FirstOrDefaultAsync(g => g.List_id == id);

        public async Task<List<GroceryList>> GetGroceryListsByAccountId(Guid accountId)
            => await _ctx.GroceryLists
                .Include(g => g.GroceryItems)
                .Where(g => g.Account_id == accountId && g.IsDeleted == false)
                .ToListAsync();

        public async Task<GroceryList> CreateGroceryList(GroceryList list)
        {
            _ctx.GroceryLists.Add(list);
            await _ctx.SaveChangesAsync();
            return list;
        }

        public async Task<GroceryList> UpdateGroceryList(GroceryList list)
        {
            _ctx.GroceryLists.Update(list);
            await _ctx.SaveChangesAsync();
            return list;
        }

        public async Task<GroceryList> SoftDeleteGroceryList(Guid id)
        {
            var existingList = await _ctx.GroceryLists
                .Where(g => g.IsDeleted == false && g.List_id == id)
                .FirstOrDefaultAsync();
            if (existingList == null)
                throw new KeyNotFoundException($"GroceryList with id {id} not found");
            existingList.IsDeleted = true;
            _ctx.GroceryLists.Update(existingList);
            await _ctx.SaveChangesAsync();
            return existingList;
        }
    }
}
