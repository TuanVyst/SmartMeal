using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
namespace Service.Implements
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepo _repo;

        public AccountService(IAccountRepo repo)
        {
            _repo = repo;
        }

        public async Task<Account> AddAccount(Account account)
        {
            return await _repo.AddAccount(account);
        }

        public async Task DeleteAccount(int id)
        {
            await _repo.DeleteAccount(id);
        }

        public async Task<List<Account>> GetAllAccounts()
        {
            return await _repo.GetAllAccounts();
        }

        public async Task<Account> GetAccountById(int id)
        {
            return await _repo.GetAccountById(id);
        }

        public async Task<Account> UpdateAccount(Account account)
        {
            return await _repo.UpdateAccount(account);
        }
    }
}
