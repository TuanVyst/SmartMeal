using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IIngredientService
    {
        Task<List<IngredientResponse>> GetAllIngredients();
        Task<IngredientResponse?> GetIngredientById(Guid id);
        Task<IngredientResponse> CreateIngredient(IngredientRequest ingredient);
        Task<IngredientResponse> UpdateIngredient(Guid id, IngredientRequest ingredient);
        Task<IngredientResponse> SoftDeleteIngredient(Guid id);
    }
}
