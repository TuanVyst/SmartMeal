using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRecipeLabelService
    {
        Task<List<RecipeLabelResponseDto>> GetAllRecipeLabels();
        Task<RecipeLabelResponseDto?> GetRecipeLabelById(Guid id);
        Task<RecipeLabelResponseDto> CreateRecipeLabel(RecipeLabelRequest recipeLabel);
        Task<RecipeLabelResponseDto> UpdateRecipeLabel(Guid id, RecipeLabelRequest recipeLabel);
        Task<RecipeLabelResponseDto> SoftDeleteRecipeLabel(Guid id);
    }
}
