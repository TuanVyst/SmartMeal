using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IReportService
    {
        Task<List<ReportResponseDto>> GetAllReports();
        Task<ReportResponseDto?> GetReportById(Guid id);
        Task<ReportResponseDto> CreateReport(ReportRequest report);
        Task<ReportResponseDto> UpdateReport(Guid id, ReportRequest report);
        Task<ReportResponseDto> SoftDeleteReport(Guid id);
    }
}
