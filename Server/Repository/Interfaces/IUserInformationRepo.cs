using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IUserInformationRepo
    {
        Task<List<UserInformation>> GetAllUserInformations();
        Task<UserInformation?> GetUserInformationById(Guid id);
        Task<UserInformation> CreateUserInformation(UserInformation userInformation);
        Task<UserInformation> UpdateUserInformation(UserInformation userInformation);
        Task<UserInformation> SoftDeleteUserInformation(Guid id);
    }
}
