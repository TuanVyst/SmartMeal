using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;

namespace Service.Interfaces
{
    public interface IIngredientService
    {
        Task<List<IngredientResponseDto>> GetAllIngredients();
        Task<IngredientResponseDto?> GetIngredientById(Guid id);
        Task<IngredientResponseDto> CreateIngredient(IngredientRequest ingredient);
        Task<IngredientResponseDto> UpdateIngredient(Guid id, IngredientRequest ingredient);
        Task<IngredientResponseDto> SoftDeleteIngredient(Guid id);
    }
}
