﻿using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IIngredientLabelRepo
    {
        Task<List<IngredientLabel>> GetAllIngredientLabels();
        Task<IngredientLabel?> GetIngredientLabelById(Guid id);
        Task<IngredientLabel> CreateIngredientLabel(IngredientLabel ingredientLabel);
        Task<IngredientLabel> UpdateIngredientLabel(IngredientLabel ingredientLabel);
        Task<IngredientLabel> SoftDeleteIngredientLabel(Guid id);
    }
}
