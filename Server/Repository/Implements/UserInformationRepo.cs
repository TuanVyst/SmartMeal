using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class UserInformationRepo : IUserInformationRepo
    {
        private readonly AppDbContext _ctx;
        public UserInformationRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<UserInformation>> GetAllUserInformations()
        {
            return await _ctx.UserInformations
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<UserInformation?> GetUserInformationById(Guid id)
            => await _ctx.UserInformations
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.User_id == id);

        public async Task<UserInformation> CreateUserInformation(UserInformation userInformation)
        {
            _ctx.UserInformations.Add(userInformation);
            await _ctx.SaveChangesAsync();
            return userInformation;
        }

        public async Task<UserInformation> UpdateUserInformation(UserInformation userInformation)
        {
            _ctx.UserInformations.Update(userInformation);
            await _ctx.SaveChangesAsync();
            return userInformation;
        }

        public async Task<UserInformation> SoftDeleteUserInformation(Guid id)
        {
            var userInformation = _ctx.UserInformations.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.User_id == id);
            if (userInformation == null)
                throw new Exception("UserInformation not found");
            userInformation.IsDeleted = true;
            _ctx.UserInformations.Update(userInformation);
            await _ctx.SaveChangesAsync();
            return userInformation;
        }
    }
}
