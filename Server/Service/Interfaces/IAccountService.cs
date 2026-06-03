using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface IAccountService
    {
        Task<List<Account>> GetAllAccounts();
        Task<Account> GetAccountById(int id);
        Task<Account> AddAccount(Account account);
        Task<Account> UpdateAccount(Account account);
        Task DeleteAccount(int id);
    }
}
