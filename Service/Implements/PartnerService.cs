using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

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

        public async Task<List<Partner>> GetAllPartners()
        {
            return await _partnerRepo.GetAllPartners();
        }

        public async Task<Partner?> GetPartnerById(Guid id)
        {
            return await _partnerRepo.GetPartnerById(id);
        }

        public async Task<Partner> CreatePartner(PartnerRequest partner)
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
                return result ?? throw new InvalidOperationException("Failed to add partner to database");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding partner");
                throw;
            }
        }

        public async Task<Partner> UpdatePartner(Partner partner)
        {
            return await _partnerRepo.UpdatePartner(partner);
        }

        public async Task<Partner> SoftDeletePartner(Guid id)
        {
            return await _partnerRepo.SoftDeletePartner(id);
        }
    }
}
