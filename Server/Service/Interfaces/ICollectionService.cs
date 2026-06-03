using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ICollectionService
    {
        Task<List<CollectionResponse>> GetAllCollections();
        Task<CollectionResponse?> GetCollectionById(Guid id);
        Task<CollectionResponse> CreateCollection(CollectionRequest request);
        Task<CollectionResponse> UpdateCollection(Guid id, CollectionRequest request);
        Task<CollectionResponse> DeleteCollection(Guid id);
    }
}
