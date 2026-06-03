using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class AccountRepo : IAccountRepo
    {
        private readonly AppDbContext _context;

        public AccountRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Account> AddAccount(Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task DeleteAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account != null)
            {
                _context.Accounts.Remove(account);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Account> GetAccountById(int id)
        {
            return await _context.Accounts.FindAsync(id);
        }

        public async Task<List<Account>> GetAllAccounts()
        {
            return await _context.Accounts.ToListAsync();
        }

        public async Task<Account> UpdateAccount(Account account)
        {
            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return account;
        }
    }
}
