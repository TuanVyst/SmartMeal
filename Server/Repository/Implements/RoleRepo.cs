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
    public class RoleRepo : IRoleRepo
    {
        private readonly AppDbContext _ctx;
        public RoleRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Role>> GetAllRoles()
        {
            return await _ctx.Roles
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Role?> GetRoleById(Guid id)
            => await _ctx.Roles
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Role_id == id);

        public async Task<Role> CreateRole(Role role)
        {
            _ctx.Roles.Add(role);
            await _ctx.SaveChangesAsync();
            return role;
        }

        public async Task<Role> UpdateRole(Role role)
        {
            _ctx.Roles.Update(role);
            await _ctx.SaveChangesAsync();
            return role;
        }

        public async Task<Role> SoftDeleteRole(Guid id)
        {
            var role = _ctx.Roles.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Role_id == id);
            if (role == null)
                throw new Exception("Role not found");
            role.IsDeleted = true;
            _ctx.Roles.Update(role);
            await _ctx.SaveChangesAsync();
            return role;
        }
    }
}
