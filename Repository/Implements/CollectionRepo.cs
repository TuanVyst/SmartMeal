using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class CollectionRepo : ICollectionRepo
    {
        private readonly AppDbContext _ctx;
        
        public CollectionRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Collection>> GetAllCollections()
        {
            return await _ctx.Collections
                .Include(c => c.SavedRecipes)
                .ToListAsync();
        }

        public async Task<Collection?> GetCollectionById(Guid id)
        {
            return await _ctx.Collections
                .Include(c => c.SavedRecipes)
                .FirstOrDefaultAsync(c => c.Collection_id == id);
        }

        public async Task<Collection> CreateCollection(Collection collection)
        {
            _ctx.Collections.Add(collection);
            await _ctx.SaveChangesAsync();
            return collection;
        }

        public async Task<Collection> UpdateCollection(Collection collection)
        {
            _ctx.Collections.Update(collection);
            await _ctx.SaveChangesAsync();
            return collection;
        }

        public async Task<Collection> DeleteCollection(Guid id)
        {
            var collection = await _ctx.Collections.FindAsync(id);
            if (collection == null)
                throw new Exception("Collection not found");
                
            _ctx.Collections.Remove(collection);
            await _ctx.SaveChangesAsync();
            return collection;
        }
    }
}
