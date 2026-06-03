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
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<GroceryList?> GetGroceryListById(Guid id)
            => await _ctx.GroceryLists
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.List_id == id);

        public async Task<GroceryList> CreateGroceryList(GroceryList groceryList)
        {
            _ctx.GroceryLists.Add(groceryList);
            await _ctx.SaveChangesAsync();
            return groceryList;
        }

        public async Task<GroceryList> UpdateGroceryList(GroceryList groceryList)
        {
            _ctx.GroceryLists.Update(groceryList);
            await _ctx.SaveChangesAsync();
            return groceryList;
        }

        public async Task<GroceryList> SoftDeleteGroceryList(Guid id)
        {
            var groceryList = _ctx.GroceryLists.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.List_id == id);
            if (groceryList == null)
                throw new Exception("GroceryList not found");
            groceryList.IsDeleted = true;
            _ctx.GroceryLists.Update(groceryList);
            await _ctx.SaveChangesAsync();
            return groceryList;
        }
    }
}
