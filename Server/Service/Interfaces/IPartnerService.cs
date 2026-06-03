using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IPartnerService
    {
        Task<List<Partner>> GetAllPartners();
        Task<Partner?> GetPartnerById(Guid id);
        Task<Partner> CreatePartner(PartnerRequest partner);
        Task<Partner> UpdatePartner(Guid id, PartnerRequest partner);
        Task<Partner> SoftDeletePartner(Guid id);
    }
}
