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
    public class PartnerService : IPartnerService
    {
        private readonly IPartnerRepo _partnerRepo;
        private readonly ILogger<PartnerService> _logger;

        public PartnerService(IPartnerRepo partnerRepo, ILogger<PartnerService> logger)
        {
            _partnerRepo = partnerRepo;
            _logger = logger;
        }

        public async Task<List<PartnerResponseDto>> GetAllPartners()
        {
            var items = await _partnerRepo.GetAllPartners();
            return items.Select(MapToDto).ToList();
        }

        public async Task<PartnerResponseDto?> GetPartnerById(Guid id)
        {
            var item = await _partnerRepo.GetPartnerById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<PartnerResponseDto> CreatePartner(PartnerRequest request)
        {
            try
            {
                var newItem = new Partner
                {
                    Partner_id = Guid.NewGuid(),
                    Name = request.Name,
                    Address = request.Address,
                    Image = request.Image,
                    Website = request.Website,
                    IsActive = true,
                    IsDeleted = false
                };

                var result = await _partnerRepo.CreatePartner(newItem);
                _logger.LogInformation("Partner '{Partner_id}' created successfully", newItem.Partner_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Partner");
                throw;
            }
        }

        public async Task<PartnerResponseDto> UpdatePartner(Guid id, PartnerRequest request)
        {
            try
            {
                var existingItem = await _partnerRepo.GetPartnerById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Partner with id {id} not found");

                existingItem.Name = request.Name;
                existingItem.Address = request.Address;
                existingItem.Image = request.Image;
                existingItem.Website = request.Website;

                var result = await _partnerRepo.UpdatePartner(existingItem);
                _logger.LogInformation("Partner '{Partner_id}' updated successfully", existingItem.Partner_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Partner '{Partner_id}'", id);
                throw;
            }
        }

        public async Task<PartnerResponseDto> SoftDeletePartner(Guid id)
        {
            var result = await _partnerRepo.SoftDeletePartner(id);
            return MapToDto(result);
        }
        
        private PartnerResponseDto MapToDto(Partner entity)
        {
            if (entity == null) return null;
            return new PartnerResponseDto
            {
                Partner_id = entity.Partner_id,
                Name = entity.Name,
                Address = entity.Address,
                Image = entity.Image,
                Website = entity.Website,
                IsActive = entity.IsActive,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
