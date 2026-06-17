using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface IUserConditionService
    {
        Task<List<UserCondition>> GetAllUserConditions();

        Task<UserCondition> GetUserConditionById(Guid id);

        Task<UserCondition> CreateUserCondition(UserConditionRequest request);

        Task<UserCondition> UpdateUserCondition(Guid id, UserConditionRequest request);

        Task<UserCondition> SoftDeleteUserCondition(Guid id);
    }
}