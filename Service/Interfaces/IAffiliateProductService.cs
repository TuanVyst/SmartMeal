using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IAffiliateProductService
    {
        Task<List<AffiliateProduct>> GetAllAffiliateProducts();
        Task<AffiliateProduct?> GetAffiliateProductById(Guid id);
        Task<AffiliateProduct> CreateAffiliateProduct(AffiliateProductRequest affiliateProduct);
        Task<AffiliateProduct> UpdateAffiliateProduct(Guid id, AffiliateProductRequest affiliateProduct);
        Task<AffiliateProduct> SoftDeleteAffiliateProduct(Guid id);
    }
}
