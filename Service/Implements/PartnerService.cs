﻿using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System.Linq;

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
            var partners = await _partnerRepo.GetAllPartners();
            return partners.Select(MapToDto).ToList();
        }

        public async Task<PartnerResponseDto?> GetPartnerById(Guid id)
        {
            var partner = await _partnerRepo.GetPartnerById(id);
            return partner == null ? null : MapToDto(partner);
        }

        public async Task<PartnerResponseDto> CreatePartner(PartnerRequest partner)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(partner.Name))
                    throw new ArgumentException("Name is required", nameof(partner.Name));
                if (partner.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(partner.Name));
                if (string.IsNullOrWhiteSpace(partner.Address))
                    throw new ArgumentException("Address is required", nameof(partner.Address));
                
                var newPartner = new Partner
                {
                    Partner_id = Guid.NewGuid(),
                    Name = partner.Name,
                    Address = partner.Address,
                    Image = partner.Image,
                    Website = partner.Website,
                    IsActive = true,
                    IsDeleted = false
                };

                var result = await _partnerRepo.CreatePartner(newPartner);
                _logger.LogInformation("Partner '{PartnerId}' ({Name}) created successfully", newPartner.Partner_id, newPartner.Name);
                return MapToDto(result ?? throw new InvalidOperationException("Failed to add partner to database"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding partner");
                throw;
            }
        }

        public async Task<PartnerResponseDto> UpdatePartner(Guid id, PartnerRequest partner)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(partner.Name))
                    throw new ArgumentException("Name is required", nameof(partner.Name));
                if (partner.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(partner.Name));
                if (string.IsNullOrWhiteSpace(partner.Address))
                    throw new ArgumentException("Address is required", nameof(partner.Address));
                
                var existingPartner = await _partnerRepo.GetPartnerById(id);
                if (existingPartner == null)
                    throw new KeyNotFoundException($"Partner with id {id} not found");

                existingPartner.Name = partner.Name;
                existingPartner.Address = partner.Address;
                existingPartner.Image = partner.Image;
                existingPartner.Website = partner.Website;

                var result = await _partnerRepo.UpdatePartner(existingPartner);
                _logger.LogInformation("Partner '{PartnerId}' updated successfully", existingPartner.Partner_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating partner '{PartnerId}'", id);
                throw;
            }
        }

        public async Task<PartnerResponseDto> SoftDeletePartner(Guid id)
        {
            var result = await _partnerRepo.SoftDeletePartner(id);
            return MapToDto(result);
        }
        
        private PartnerResponseDto MapToDto(Partner partner)
        {
            return new PartnerResponseDto
            {
                Partner_id = partner.Partner_id,
                Name = partner.Name,
                Address = partner.Address,
                Image = partner.Image,
                Website = partner.Website,
                IsActive = partner.IsActive,
                IsDeleted = partner.IsDeleted
            };
        }
    }
}
