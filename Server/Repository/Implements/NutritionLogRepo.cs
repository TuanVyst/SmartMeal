using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class NutritionLogRepo : INutritionLogRepo
    {
        private readonly AppDbContext _ctx;

        public NutritionLogRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<NutritionLog>> GetAllNutritionLogs()
        {
            return await _ctx.NutritionLogs
                .Include(x => x.Account)
                .Include(x => x.Recipe)
                .Include(x => x.Ingredient)
                .Where(x => x.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<List<NutritionLog>> GetNutritionLogsByAccountAndDate(Guid accountId, DateTime date)
        {
            return await _ctx.NutritionLogs
                .Include(x => x.Recipe)
                .Where(x => x.IsDeleted == false
                    && x.Account_id == accountId
                    && x.LogDate.Date == date.Date)
                .ToListAsync();
        }

        public async Task<List<NutritionLog>> GetNutritionLogsByAccountAndDateRange(Guid accountId, DateTime startDate, DateTime endDate)
        {
            return await _ctx.NutritionLogs
                .Include(x => x.Recipe)
                .Where(x => x.IsDeleted == false
                    && x.Account_id == accountId
                    && x.LogDate.Date >= startDate.Date
                    && x.LogDate.Date <= endDate.Date)
                .ToListAsync();
        }

        public async Task<NutritionLog?> GetNutritionLogById(Guid id)
        {
            return await _ctx.NutritionLogs
                .Include(x => x.Account)
                .Include(x => x.Recipe)
                .Include(x => x.Ingredient)
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Log_id == id);
        }

        public async Task<NutritionLog> CreateNutritionLog(NutritionLog nutritionLog)
        {
            _ctx.NutritionLogs.Add(nutritionLog);
            await _ctx.SaveChangesAsync();

            return nutritionLog;
        }

        public async Task<NutritionLog> UpdateNutritionLog(NutritionLog nutritionLog)
        {
            _ctx.NutritionLogs.Update(nutritionLog);
            await _ctx.SaveChangesAsync();

            return nutritionLog;
        }

        public async Task<NutritionLog> SoftDeleteNutritionLog(Guid id)
        {
            var entity = await _ctx.NutritionLogs
                .Where(x => x.IsDeleted == false)
                .FirstOrDefaultAsync(x => x.Log_id == id);

            if (entity == null)
                throw new Exception("NutritionLog not found");

            entity.IsDeleted = true;

            _ctx.NutritionLogs.Update(entity);
            await _ctx.SaveChangesAsync();

            return entity;
        }
    }
}
