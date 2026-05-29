using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;

namespace Service.Interfaces
{
    public interface IIngredientLabelService
    {
        Task<List<IngredientLabelResponseDto>> GetAllIngredientLabels();
        Task<IngredientLabelResponseDto?> GetIngredientLabelById(Guid id);
        Task<IngredientLabelResponseDto> CreateIngredientLabel(IngredientLabelRequest ingredientLabel);
        Task<IngredientLabelResponseDto> UpdateIngredientLabel(Guid id, IngredientLabelRequest ingredientLabel);
        Task<IngredientLabelResponseDto> SoftDeleteIngredientLabel(Guid id);
    }
}
