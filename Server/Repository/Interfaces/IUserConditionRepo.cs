using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IUserConditionRepo
    {
        Task<List<UserCondition>> GetAllUserConditions();

        Task<UserCondition?> GetUserConditionById(Guid id);

        Task<UserCondition> CreateUserCondition(UserCondition userCondition);

        Task<UserCondition> UpdateUserCondition(UserCondition userCondition);

        Task<UserCondition> SoftDeleteUserCondition(Guid id);
    }
}