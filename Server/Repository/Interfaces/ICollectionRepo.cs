using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface ICollectionRepo
    {
        Task<List<Collection>> GetAllCollections();
        Task<Collection?> GetCollectionById(Guid id);
        Task<Collection?> GetDefaultCollectionByAccountId(Guid accountId);
        Task<Collection> CreateCollection(Collection collection);
        Task<Collection> UpdateCollection(Collection collection);
        Task<Collection> SoftDeleteCollection(Guid id);
    }
}
