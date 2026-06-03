using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IAffiliateProductService
    {
        Task<List<AffiliateProductResponseDto>> GetAllAffiliateProducts();
        Task<AffiliateProductResponseDto?> GetAffiliateProductById(Guid id);
        Task<AffiliateProductResponseDto> CreateAffiliateProduct(AffiliateProductRequest affiliateProduct);
        Task<AffiliateProductResponseDto> UpdateAffiliateProduct(Guid id, AffiliateProductRequest affiliateProduct);
        Task<AffiliateProductResponseDto> SoftDeleteAffiliateProduct(Guid id);
    }
}
