using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface INutritionalValueService
    {
        Task<List<NutritionalValueResponseDto>> GetAllNutritionalValues();
        Task<NutritionalValueResponseDto?> GetNutritionalValueById(Guid id);
        Task<NutritionalValueResponseDto> CreateNutritionalValue(NutritionalValueRequest nutritionalValue);
        Task<NutritionalValueResponseDto> UpdateNutritionalValue(Guid id, NutritionalValueRequest nutritionalValue);
        Task<NutritionalValueResponseDto> SoftDeleteNutritionalValue(Guid id);
    }
}
