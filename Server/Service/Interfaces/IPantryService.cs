using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPantryService
    {
        Task<List<PantryResponseDto>> GetAllPantries();
        Task<PantryResponseDto?> GetPantryById(Guid id);
        Task<PantryResponseDto> CreatePantry(PantryRequest pantry);
        Task<PantryResponseDto> UpdatePantry(Guid id, PantryRequest pantry);
        Task<PantryResponseDto> HardDeletePantry(Guid id);
    }
}
