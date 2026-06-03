using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IAffiliateProductRepo
    {
        Task<List<AffiliateProduct>> GetAllAffiliateProducts();
        Task<AffiliateProduct?> GetAffiliateProductById(Guid id);
        Task<AffiliateProduct> CreateAffiliateProduct(AffiliateProduct affiliateProduct);
        Task<AffiliateProduct> UpdateAffiliateProduct(AffiliateProduct affiliateProduct);
        Task<AffiliateProduct> SoftDeleteAffiliateProduct(Guid id);
    }
}
