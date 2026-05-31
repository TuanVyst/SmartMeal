using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class CollectionService : ICollectionService
    {
        private readonly ICollectionRepo _collectionRepo;

        public CollectionService(ICollectionRepo collectionRepo)
        {
            _collectionRepo = collectionRepo;
        }

        public async Task<List<CollectionResponse>> GetAllCollections()
        {
            var collections = await _collectionRepo.GetAllCollections();
            return collections.Select(c => MapToResponse(c)).ToList();
        }

        public async Task<CollectionResponse?> GetCollectionById(Guid id)
        {
            var collection = await _collectionRepo.GetCollectionById(id);
            if (collection == null) return null;
            return MapToResponse(collection);
        }

        public async Task<CollectionResponse> CreateCollection(CollectionRequest request)
        {
            var collection = new Collection
            {
                Account_id = request.Account_id,
                Name = request.Name,
                IsPublic = request.IsPublic
            };

            var created = await _collectionRepo.CreateCollection(collection);
            return MapToResponse(created);
        }

        public async Task<CollectionResponse> UpdateCollection(Guid id, CollectionRequest request)
        {
            var existing = await _collectionRepo.GetCollectionById(id);
            if (existing == null) throw new Exception("Collection not found");

            existing.Account_id = request.Account_id;
            existing.Name = request.Name;
            existing.IsPublic = request.IsPublic;

            var updated = await _collectionRepo.UpdateCollection(existing);
            return MapToResponse(updated);
        }

        public async Task<CollectionResponse> DeleteCollection(Guid id)
        {
            var deleted = await _collectionRepo.DeleteCollection(id);
            return MapToResponse(deleted);
        }

        private CollectionResponse MapToResponse(Collection collection)
        {
            return new CollectionResponse
            {
                Collection_id = collection.Collection_id,
                Account_id = collection.Account_id,
                Name = collection.Name,
                CreatedAt = collection.CreatedAt,
                IsPublic = collection.IsPublic
            };
        }
    }
}
