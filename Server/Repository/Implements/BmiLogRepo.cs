using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class BmiLogRepo : IBmiLogRepo
    {
        private readonly AppDbContext _ctx;

        public BmiLogRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<BmiLog>> GetBmiLogsByAccountId(Guid accountId)
        {
            return await _ctx.BmiLogs
                .Where(b => b.Account_id == accountId && !b.IsDeleted)
                .OrderByDescending(b => b.RecordedAt)
                .ToListAsync();
        }

        public async Task<BmiLog> CreateBmiLog(BmiLog bmiLog)
        {
            _ctx.BmiLogs.Add(bmiLog);
            await _ctx.SaveChangesAsync();
            return bmiLog;
        }
    }
}
