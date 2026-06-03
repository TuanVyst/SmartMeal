using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPlanService
    {
        Task<List<PlanResponseDto>> GetAllPlans();
        Task<PlanResponseDto?> GetPlanById(Guid id);
        Task<PlanResponseDto> CreatePlan(PlanRequest plan);
        Task<PlanResponseDto> UpdatePlan(Guid id, PlanRequest plan);
        Task<PlanResponseDto> SoftDeletePlan(Guid id);
    }
}
