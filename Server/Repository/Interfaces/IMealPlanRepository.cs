using BusinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IMealPlanRepository
    {
        Task<MealPlan> GetActivePlanByAccountId(Guid accountId);
        Task<MealPlan> GetPlanById(Guid planId);
        Task<List<MealPlan>> GetAllPlansByAccountId(Guid accountId);
        Task<MealPlan> AddPlan(MealPlan plan);
        Task UpdatePlan(MealPlan plan);
        Task UpdateEntry(MealPlanEntry entry);
        Task<MealPlanEntry> GetEntryById(Guid entryId);
    }
}
