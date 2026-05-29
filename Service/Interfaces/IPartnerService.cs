using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IPartnerService
    {
        Task<List<PartnerResponse>> GetAllPartners();
        Task<PartnerResponse?> GetPartnerById(Guid id);
        Task<PartnerResponse> CreatePartner(PartnerRequest partner);
        Task<PartnerResponse> UpdatePartner(Guid id, PartnerRequest partner);
        Task<PartnerResponse> SoftDeletePartner(Guid id);
    }
}
