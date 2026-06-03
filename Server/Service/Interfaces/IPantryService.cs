using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPantryService
    {
        Task<List<PantryResponse>> GetAllPantries();
        Task<PantryResponse?> GetPantryById(Guid id);
        Task<List<PantryResponse>> GetPantriesByAccountId(Guid accountId);
        Task<List<PantryResponse>> GetPantriesByIngredientId(Guid ingredientId);
        Task<List<PantryResponse>> GetExpiringPantries(Guid accountId, int daysThreshold);
        Task<PantryResponse> CreatePantry(PantryRequest request, Guid accountId);
        Task<PantryResponse> UpdatePantry(Guid id, PantryUpdateRequest request, Guid accountId);
        Task<PantryResponse> SoftDeletePantry(Guid id, Guid accountId);
    }
}
