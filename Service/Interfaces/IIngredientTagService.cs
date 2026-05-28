using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IIngredientTagService
    {
        Task<List<IngredientTag>> GetAllIngredientTags();
        Task<IngredientTag?> GetIngredientTagById(Guid id);
        Task<IngredientTag> CreateIngredientTag(IngredientTagRequest ingredientTag);
        Task<IngredientTag> UpdateIngredientTag(IngredientTag ingredientTag);
        Task<IngredientTag> SoftDeleteIngredientTag(Guid id);
    }
}
