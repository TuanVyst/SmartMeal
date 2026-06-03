using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPartnerService
    {
        Task<List<PartnerResponseDto>> GetAllPartners();
        Task<PartnerResponseDto?> GetPartnerById(Guid id);
        Task<PartnerResponseDto> CreatePartner(PartnerRequest partner);
        Task<PartnerResponseDto> UpdatePartner(Guid id, PartnerRequest partner);
        Task<PartnerResponseDto> SoftDeletePartner(Guid id);
    }
}
