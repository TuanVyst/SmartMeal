using BusinessObject.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Repository.Interfaces
{
    public interface IAccountRepo
    {
        Task<List<Account>> GetAllAccounts();
        Task<Account> GetAccountById(Guid id);
        Task<Account> GetAccountByUsername(string username);
        Task<Account> GetAccountByEmail(string email);
        Task<Account> AddAccount(Account account);
        Task<Account> UpdateAccount(Account account);
        Task DeleteAccount(Guid id);
    }
}
