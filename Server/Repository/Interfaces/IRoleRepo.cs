using BusinessObject.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Repository.Interfaces
{
    public interface IRoleRepo
    {
        Task<List<Role>> GetAllRoles();
        Task<Role?> GetRoleById(Guid id);
        Task<Role> CreateRole(Role role);
        Task<Role> UpdateRole(Role role);
        Task<Role> SoftDeleteRole(Guid id);
    }
}
