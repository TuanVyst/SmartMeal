using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IPantryRepo
    {
        Task<List<Pantry>> GetAllPantries();
        Task<Pantry?> GetPantryById(Guid id);
        Task<List<Pantry>> GetPantriesByAccountId(Guid accountId);
        Task<List<Pantry>> GetPantriesByIngredientId(Guid ingredientId);
        Task<Pantry?> GetPantryByAccountAndIngredient(Guid accountId, Guid ingredientId);
        Task<List<Pantry>> GetExpiringPantries(Guid accountId, DateTime thresholdDate);
        Task<Pantry> CreatePantry(Pantry pantry);
        Task<Pantry> UpdatePantry(Pantry pantry);
        Task<Pantry> HotDeletePantry(Guid id);
    }
}
