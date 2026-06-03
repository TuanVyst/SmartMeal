using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class PlanRepo : IPlanRepo
    {
        private readonly AppDbContext _ctx;
        public PlanRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Plan>> GetAllPlans()
        {
            return await _ctx.Plans
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Plan?> GetPlanById(Guid id)
            => await _ctx.Plans
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Plan_id == id);

        public async Task<Plan> CreatePlan(Plan plan)
        {
            _ctx.Plans.Add(plan);
            await _ctx.SaveChangesAsync();
            return plan;
        }

        public async Task<Plan> UpdatePlan(Plan plan)
        {
            _ctx.Plans.Update(plan);
            await _ctx.SaveChangesAsync();
            return plan;
        }

        public async Task<Plan> SoftDeletePlan(Guid id)
        {
            var plan = _ctx.Plans.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Plan_id == id);
            if (plan == null)
                throw new Exception("Plan not found");
            plan.IsDeleted = true;
            _ctx.Plans.Update(plan);
            await _ctx.SaveChangesAsync();
            return plan;
        }
    }
}
