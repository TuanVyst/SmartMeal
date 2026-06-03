using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRoleService
    {
        Task<List<RoleResponseDto>> GetAllRoles();
        Task<RoleResponseDto?> GetRoleById(Guid id);
        Task<RoleResponseDto> CreateRole(RoleRequest role);
        Task<RoleResponseDto> UpdateRole(Guid id, RoleRequest role);
        Task<RoleResponseDto> SoftDeleteRole(Guid id);
    }
}
