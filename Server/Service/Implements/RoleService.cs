using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepo _roleRepo;
        private readonly ILogger<RoleService> _logger;

        public RoleService(IRoleRepo roleRepo, ILogger<RoleService> logger)
        {
            _roleRepo = roleRepo;
            _logger = logger;
        }

        public async Task<List<RoleResponseDto>> GetAllRoles()
        {
            var items = await _roleRepo.GetAllRoles();
            return items.Select(MapToDto).ToList();
        }

        public async Task<RoleResponseDto?> GetRoleById(Guid id)
        {
            var item = await _roleRepo.GetRoleById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<RoleResponseDto> CreateRole(RoleRequest request)
        {
            try
            {
                var newItem = new Role
                {
                    Role_id = Guid.NewGuid(),
                    Name = request.Name,
                    Description = request.Description,
                    IsDeleted = false
                };

                var result = await _roleRepo.CreateRole(newItem);
                _logger.LogInformation("Role '{Role_id}' created successfully", newItem.Role_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Role");
                throw;
            }
        }

        public async Task<RoleResponseDto> UpdateRole(Guid id, RoleRequest request)
        {
            try
            {
                var existingItem = await _roleRepo.GetRoleById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Role with id {id} not found");

                existingItem.Name = request.Name;
                existingItem.Description = request.Description;

                var result = await _roleRepo.UpdateRole(existingItem);
                _logger.LogInformation("Role '{Role_id}' updated successfully", existingItem.Role_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Role '{Role_id}'", id);
                throw;
            }
        }

        public async Task<RoleResponseDto> SoftDeleteRole(Guid id)
        {
            var result = await _roleRepo.SoftDeleteRole(id);
            return MapToDto(result);
        }
        
        private RoleResponseDto MapToDto(Role entity)
        {
            if (entity == null) return null;
            return new RoleResponseDto
            {
                Role_id = entity.Role_id,
                Name = entity.Name,
                Description = entity.Description,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
