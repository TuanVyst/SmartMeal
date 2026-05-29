using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IAffiliateProductService
    {
        Task<List<AffiliateProductResponse>> GetAllAffiliateProducts();
        Task<AffiliateProductResponse?> GetAffiliateProductById(Guid id);
        Task<AffiliateProductResponse> CreateAffiliateProduct(AffiliateProductRequest affiliateProduct);
        Task<AffiliateProductResponse> UpdateAffiliateProduct(Guid id, AffiliateProductRequest affiliateProduct);
        Task<AffiliateProductResponse> SoftDeleteAffiliateProduct(Guid id);
    }
}
