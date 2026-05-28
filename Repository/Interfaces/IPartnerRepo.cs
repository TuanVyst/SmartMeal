using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IPartnerRepo
    {
        Task<List<Partner>> GetAllPartners();
        Task<Partner?> GetPartnerById(Guid id);
        Task<Partner> CreatePartner(Partner partner);
        Task<Partner> UpdatePartner(Partner partner);
        Task<Partner> SoftDeletePartner(Guid id);
    }
}
