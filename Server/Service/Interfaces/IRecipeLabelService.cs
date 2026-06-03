using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRecipeLabelService
    {
        Task<List<RecipeLabelResponse>> GetAllRecipeLabels();
        Task<RecipeLabelResponse?> GetRecipeLabelById(Guid id);
        Task<RecipeLabelResponse> CreateRecipeLabel(RecipeLabelRequest request);
        Task<RecipeLabelResponse> UpdateRecipeLabel(Guid id, RecipeLabelRequest request);
        Task<RecipeLabelResponse> DeleteRecipeLabel(Guid id);
    }
}
