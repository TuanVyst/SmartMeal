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
        Task<List<Pantry>> GetPantryByAccountId(Guid accountId);
        Task<Pantry> CreatePantry(Pantry pantry);
        Task<Pantry> UpdatePantry(Pantry pantry);
        Task<Pantry> HardDeletePantry(Guid id);
    }
}
