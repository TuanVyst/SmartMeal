using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface ICollectionRepo
    {
        Task<List<Collection>> GetAllCollections();
        Task<Collection?> GetCollectionById(Guid id);
        Task<Collection> CreateCollection(Collection collection);
        Task<Collection> UpdateCollection(Collection collection);
        Task<Collection> DeleteCollection(Guid id);
    }
}
