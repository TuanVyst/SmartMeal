using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IIngredientTagService
    {
        Task<List<IngredientTagResponseDto>> GetAllIngredientTags();
        Task<IngredientTagResponseDto?> GetIngredientTagById(Guid id);
        Task<IngredientTagResponseDto> CreateIngredientTag(IngredientTagRequest ingredientTag);
        Task<IngredientTagResponseDto> UpdateIngredientTag(Guid id, IngredientTagRequest ingredientTag);
        Task<IngredientTagResponseDto> SoftDeleteIngredientTag(Guid id);
    }
}
