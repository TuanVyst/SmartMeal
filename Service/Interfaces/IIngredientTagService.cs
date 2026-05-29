using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IIngredientTagService
    {
        Task<List<IngredientTagResponse>> GetAllIngredientTags();
        Task<IngredientTagResponse?> GetIngredientTagById(Guid id);
        Task<IngredientTagResponse> CreateIngredientTag(IngredientTagRequest ingredientTag);
        Task<IngredientTagResponse> UpdateIngredientTag(Guid id, IngredientTagRequest ingredientTag);
        Task<IngredientTagResponse> SoftDeleteIngredientTag(Guid id);
    }
}
