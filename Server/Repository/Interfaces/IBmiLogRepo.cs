using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IBmiLogRepo
    {
        Task<List<BmiLog>> GetBmiLogsByAccountId(Guid accountId);
        Task<BmiLog> CreateBmiLog(BmiLog bmiLog);
    }
}
