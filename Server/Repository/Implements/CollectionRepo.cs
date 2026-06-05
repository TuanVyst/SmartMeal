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
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Collection?> GetCollectionById(Guid id)
            => await _ctx.Collections
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Collection_id == id);

        public async Task<Collection?> GetDefaultCollectionByAccountId(Guid accountId)
            => await _ctx.Collections
                .Where(i => !i.IsDeleted && i.Account_id == accountId && i.Name == "Favorites")
                .FirstOrDefaultAsync();

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

        public async Task<Collection> SoftDeleteCollection(Guid id)
        {
            var collection = _ctx.Collections.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Collection_id == id);
            if (collection == null)
                throw new Exception("Collection not found");
            collection.IsDeleted = true;
            _ctx.Collections.Update(collection);
            await _ctx.SaveChangesAsync();
            return collection;
        }
    }
}
