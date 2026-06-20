using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class BmiLogService : IBmiLogService
    {
        private readonly IBmiLogRepo _bmiLogRepo;

        public BmiLogService(IBmiLogRepo bmiLogRepo)
        {
            _bmiLogRepo = bmiLogRepo;
        }

        public async Task<List<BmiLog>> GetBmiLogsByAccountId(Guid accountId)
        {
            return await _bmiLogRepo.GetBmiLogsByAccountId(accountId);
        }

        public async Task<BmiLog> CreateBmiLog(Guid accountId, double height, double weight)
        {
            var bmi = weight / ((height / 100) * (height / 100));
            var bmiLevel = bmi < 18.5 ? "underweight"
                         : bmi < 25 ? "normal"
                         : bmi < 30 ? "overweight"
                         : "obese";

            var log = new BmiLog
            {
                Log_id = Guid.NewGuid(),
                Account_id = accountId,
                Height = height,
                Weight = weight,
                Bmi = Math.Round(bmi, 1),
                BmiLevel = bmiLevel,
                RecordedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            return await _bmiLogRepo.CreateBmiLog(log);
        }
    }
}
