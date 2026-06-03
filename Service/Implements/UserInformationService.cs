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
    public class UserInformationService : IUserInformationService
    {
        private readonly IUserInformationRepo _userInformationRepo;
        private readonly ILogger<UserInformationService> _logger;

        public UserInformationService(IUserInformationRepo userInformationRepo, ILogger<UserInformationService> logger)
        {
            _userInformationRepo = userInformationRepo;
            _logger = logger;
        }

        public async Task<List<UserInformationResponseDto>> GetAllUserInformations()
        {
            var items = await _userInformationRepo.GetAllUserInformations();
            return items.Select(MapToDto).ToList();
        }

        public async Task<UserInformationResponseDto?> GetUserInformationById(Guid id)
        {
            var item = await _userInformationRepo.GetUserInformationById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<UserInformationResponseDto> CreateUserInformation(UserInformationRequest request)
        {
            try
            {
                var newItem = new UserInformation
                {
                    User_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
                    Name = request.Name,
                    Phone = request.Phone,
                    Email = request.Email,
                    Address = request.Address,
                    IsDeleted = false
                };

                var result = await _userInformationRepo.CreateUserInformation(newItem);
                _logger.LogInformation("UserInformation '{User_id}' created successfully", newItem.User_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating UserInformation");
                throw;
            }
        }

        public async Task<UserInformationResponseDto> UpdateUserInformation(Guid id, UserInformationRequest request)
        {
            try
            {
                var existingItem = await _userInformationRepo.GetUserInformationById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"UserInformation with id {id} not found");

                existingItem.Account_id = request.Account_id;
                existingItem.Name = request.Name;
                existingItem.Phone = request.Phone;
                existingItem.Email = request.Email;
                existingItem.Address = request.Address;

                var result = await _userInformationRepo.UpdateUserInformation(existingItem);
                _logger.LogInformation("UserInformation '{User_id}' updated successfully", existingItem.User_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating UserInformation '{User_id}'", id);
                throw;
            }
        }

        public async Task<UserInformationResponseDto> SoftDeleteUserInformation(Guid id)
        {
            var result = await _userInformationRepo.SoftDeleteUserInformation(id);
            return MapToDto(result);
        }
        
        private UserInformationResponseDto MapToDto(UserInformation entity)
        {
            if (entity == null) return null;
            return new UserInformationResponseDto
            {
                User_id = entity.User_id,
                Account_id = entity.Account_id,
                Name = entity.Name,
                Phone = entity.Phone,
                Email = entity.Email,
                Address = entity.Address,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
