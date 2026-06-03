using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface INutritionalValueRepo
    {
        Task<List<NutritionalValue>> GetAllNutritionalValues();
        Task<NutritionalValue?> GetNutritionalValueById(Guid id);
        Task<NutritionalValue> CreateNutritionalValue(NutritionalValue nutritionalValue);
        Task<NutritionalValue> UpdateNutritionalValue(NutritionalValue nutritionalValue);
        Task<NutritionalValue> SoftDeleteNutritionalValue(Guid id);
    }
}
