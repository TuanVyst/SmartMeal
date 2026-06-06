using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ICollectionService
    {
        Task<List<CollectionResponseDto>> GetAllCollections();
        Task<CollectionResponseDto?> GetCollectionById(Guid id);
        Task<CollectionResponseDto?> GetDefaultCollectionByAccountId(Guid accountId);
        Task<CollectionResponseDto> CreateCollection(CollectionRequest collection);
        Task<CollectionResponseDto> UpdateCollection(Guid id, CollectionRequest collection);
        Task<CollectionResponseDto> SoftDeleteCollection(Guid id);
    }
}
