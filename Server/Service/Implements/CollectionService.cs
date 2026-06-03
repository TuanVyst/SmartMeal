using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class CollectionService : ICollectionService
    {
        private readonly ICollectionRepo _collectionRepo;
        private readonly ILogger<CollectionService> _logger;

        public CollectionService(ICollectionRepo collectionRepo, ILogger<CollectionService> logger)
        {
            _collectionRepo = collectionRepo;
            _logger = logger;
        }

        public async Task<List<CollectionResponseDto>> GetAllCollections()
        {
            var items = await _collectionRepo.GetAllCollections();
            return items.Select(MapToDto).ToList();
        }

        public async Task<CollectionResponseDto?> GetCollectionById(Guid id)
        {
            var item = await _collectionRepo.GetCollectionById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<CollectionResponseDto> CreateCollection(CollectionRequest request)
        {
            try
            {
                var newItem = new Collection
                {
                    Collection_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
                    Name = request.Name,
                    IsPublic = request.IsPublic,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var result = await _collectionRepo.CreateCollection(newItem);
                _logger.LogInformation("Collection '{Collection_id}' created successfully", newItem.Collection_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Collection");
                throw;
            }
        }

        public async Task<CollectionResponseDto> UpdateCollection(Guid id, CollectionRequest request)
        {
            try
            {
                var existingItem = await _collectionRepo.GetCollectionById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Collection with id {id} not found");

                existingItem.Account_id = request.Account_id;
                existingItem.Name = request.Name;
                existingItem.IsPublic = request.IsPublic;

                var result = await _collectionRepo.UpdateCollection(existingItem);
                _logger.LogInformation("Collection '{Collection_id}' updated successfully", existingItem.Collection_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Collection '{Collection_id}'", id);
                throw;
            }
        }

        public async Task<CollectionResponseDto> SoftDeleteCollection(Guid id)
        {
            var result = await _collectionRepo.SoftDeleteCollection(id);
            return MapToDto(result);
        }
        
        private CollectionResponseDto MapToDto(Collection entity)
        {
            if (entity == null) return null;
            return new CollectionResponseDto
            {
                Collection_id = entity.Collection_id,
                Account_id = entity.Account_id,
                Name = entity.Name,
                CreatedAt = entity.CreatedAt,
                IsPublic = entity.IsPublic,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
