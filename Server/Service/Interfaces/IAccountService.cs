using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface IAccountService
    {
        Task<List<Account>> GetAllAccounts();
        Task<Account> GetAccountById(Guid id);
        Task<Account> AddAccount(Account account);
        Task<Account> UpdateAccount(Account account);
        Task DeleteAccount(Guid id);
        Task<AuthResponseDto> Login(LoginRequest request);
        Task<AuthResponseDto> VerifyOtp(VerifyOtpRequest request);
        Task<AuthResponseDto> VerifyRegisterOtp(VerifyOtpRequest request);
        Task<AuthResponseDto> Register(RegisterRequest request);
        Task<AuthResponseDto> GoogleLogin(GoogleLoginRequest request);
    }
}
