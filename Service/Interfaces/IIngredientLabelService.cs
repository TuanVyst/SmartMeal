using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IIngredientLabelService
    {
        Task<List<IngredientLabel>> GetAllIngredientLabels();
        Task<IngredientLabel?> GetIngredientLabelById(Guid id);
        Task<IngredientLabel> CreateIngredientLabel(IngredientLabelRequest ingredientLabel);
        Task<IngredientLabel> UpdateIngredientLabel(IngredientLabel ingredientLabel);
        Task<IngredientLabel> SoftDeleteIngredientLabel(Guid id);
    }
}
