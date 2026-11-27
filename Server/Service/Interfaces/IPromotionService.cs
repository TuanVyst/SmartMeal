using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPromotionService
    {
        Task<List<PromotionResponseDto>> GetAllAsync();
        Task<PromotionResponseDto?> GetByIdAsync(Guid id);
        Task<PromotionResponseDto> CreateAsync(PromotionRequest request, Guid? createdByAccountId);
        Task<PromotionResponseDto> UpdateAsync(Guid id, PromotionRequest request);
        Task<PromotionResponseDto> EndAsync(Guid id);
        Task<PromotionResponseDto> DeleteAsync(Guid id);
    }
}
