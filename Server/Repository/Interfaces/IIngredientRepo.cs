using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IIngredientRepo
    {
        Task<List<Ingredient>> GetAllIngredients();
        Task<Ingredient?> GetIngredientById(Guid id);
        Task<Ingredient> CreateIngredient(Ingredient ingredient);
        Task<Ingredient> UpdateIngredient(Ingredient ingredient);
        Task<Ingredient> SoftDeleteIngredient(Guid id);
    }
}
