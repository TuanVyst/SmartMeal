using BusinessObject.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Repository.Interfaces
{
    public interface IReportRepo
    {
        Task<List<Report>> GetAllReports();
        Task<Report?> GetReportById(Guid id);
        Task<Report> CreateReport(Report report);
        Task<Report> UpdateReport(Report report);
        Task<Report> SoftDeleteReport(Guid id);
    }
}
