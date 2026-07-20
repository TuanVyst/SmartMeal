using BusinessObject.Dtos.ResponseModels;
using System;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IHealthReportService
    {
        Task<HealthReportResponseDto> GetHealthReportAsync(Guid accountId);
    }
}
