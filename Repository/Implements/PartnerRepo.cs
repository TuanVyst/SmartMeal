using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class PartnerRepo : IPartnerRepo
    {
        private readonly AppDbContext _ctx;
        public PartnerRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Partner>> GetAllPartners()
        {
            return await _ctx.Partners
                .Include(p => p.AffiliateProducts)
                .Where(p => p.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Partner?> GetPartnerById(Guid id)
            => await _ctx.Partners
                .Include(p => p.AffiliateProducts)
                .Where(p => !p.IsDeleted)
                .FirstOrDefaultAsync(p => p.Partner_id == id);

        public async Task<Partner> CreatePartner(Partner partner)
        {
            _ctx.Partners.Add(partner);
            await _ctx.SaveChangesAsync();
            return partner;
        }

        public async Task<Partner> UpdatePartner(Partner partner)
        {
            _ctx.Partners.Update(partner);
            await _ctx.SaveChangesAsync();
            return partner;
        }

        public async Task<Partner> SoftDeletePartner(Guid id)
        {
            var partner = _ctx.Partners.Where(p => p.IsDeleted == false).FirstOrDefault(p => p.Partner_id == id);
            if (partner == null)
                throw new Exception("Partner not found");
            partner.IsDeleted = true;
            _ctx.Partners.Update(partner);
            await _ctx.SaveChangesAsync();
            return partner;
        }
    }
}
