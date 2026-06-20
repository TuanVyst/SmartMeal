using BusinessObject.Entities;

namespace Service.Interfaces
{
    public interface IBmiLogService
    {
        Task<List<BmiLog>> GetBmiLogsByAccountId(Guid accountId);
        Task<BmiLog> CreateBmiLog(Guid accountId, double height, double weight);
    }
}
