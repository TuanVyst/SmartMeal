using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IIngredientTagRepo
    {
            Task<List<IngredientTag>> GetAllIngredientTags();
            Task<IngredientTag?> GetIngredientTagById(Guid id);
            Task<IngredientTag> CreateIngredientTag(IngredientTag ingredientTag);
            Task<IngredientTag> UpdateIngredientTag(IngredientTag ingredientTag);
            Task<IngredientTag> SoftDeleteIngredientTag(Guid id);
    }
}
