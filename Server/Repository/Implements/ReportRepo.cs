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
    public class ReportRepo : IReportRepo
    {
        private readonly AppDbContext _ctx;
        public ReportRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Report>> GetAllReports()
        {
            return await _ctx.Reports
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Report?> GetReportById(Guid id)
            => await _ctx.Reports
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Report_id == id);

        public async Task<Report> CreateReport(Report report)
        {
            _ctx.Reports.Add(report);
            await _ctx.SaveChangesAsync();
            return report;
        }

        public async Task<Report> UpdateReport(Report report)
        {
            _ctx.Reports.Update(report);
            await _ctx.SaveChangesAsync();
            return report;
        }

        public async Task<Report> SoftDeleteReport(Guid id)
        {
            var report = _ctx.Reports.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Report_id == id);
            if (report == null)
                throw new Exception("Report not found");
            report.IsDeleted = true;
            _ctx.Reports.Update(report);
            await _ctx.SaveChangesAsync();
            return report;
        }
    }
}
