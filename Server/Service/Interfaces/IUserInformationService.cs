using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IUserInformationService
    {
        Task<List<UserInformationResponseDto>> GetAllUserInformations();
        Task<UserInformationResponseDto?> GetUserInformationById(Guid id);
        Task<UserInformationResponseDto?> GetUserInformationByAccountId(Guid accountId);
        Task<UserInformationResponseDto> CreateUserInformation(UserInformationRequest userInformation);
        Task<UserInformationResponseDto> UpdateUserInformation(Guid id, UserInformationRequest userInformation);
        Task<UserInformationResponseDto> SoftDeleteUserInformation(Guid id);
    }
}
