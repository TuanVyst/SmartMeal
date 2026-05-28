using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

namespace Service.Interfaces
{
    public interface IIngredientService
    {
        Task<List<Ingredient>> GetAllIngredients();
        Task<Ingredient?> GetIngredientById(Guid id);
        Task<Ingredient> CreateIngredient(IngredientRequest ingredient);
        Task<Ingredient> UpdateIngredient(Guid id, IngredientRequest ingredient);
        Task<Ingredient> SoftDeleteIngredient(Guid id);
    }
}
