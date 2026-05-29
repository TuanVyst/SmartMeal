using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IIngredientLabelService
    {
        Task<List<IngredientLabelResponse>> GetAllIngredientLabels();
        Task<IngredientLabelResponse?> GetIngredientLabelById(Guid id);
        Task<IngredientLabelResponse> CreateIngredientLabel(IngredientLabelRequest ingredientLabel);
        Task<IngredientLabelResponse> UpdateIngredientLabel(Guid id, IngredientLabelRequest ingredientLabel);
        Task<IngredientLabelResponse> SoftDeleteIngredientLabel(Guid id);
    }
}
