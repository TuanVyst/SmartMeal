using BusinessObject.Dtos.ResponseModels;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class HealthReportService : IHealthReportService
    {
        private readonly IHealthProfileRepo _healthProfileRepo;
        private readonly INutritionGoalRepo _nutritionGoalRepo;

        public HealthReportService(IHealthProfileRepo healthProfileRepo, INutritionGoalRepo nutritionGoalRepo)
        {
            _healthProfileRepo = healthProfileRepo;
            _nutritionGoalRepo = nutritionGoalRepo;
        }

        public async Task<HealthReportResponseDto> GetHealthReportAsync(Guid accountId)
        {
            var profile = await _healthProfileRepo.GetHealthProfileByAccountId(accountId);
            var goal = await _nutritionGoalRepo.GetNutritionGoalByAccountId(accountId);

            if (profile == null || goal == null)
            {
                throw new Exception("Chưa có dữ liệu sức khỏe. Vui lòng làm bài khảo sát.");
            }

            double currentWeight = profile.Weight ?? 0;
            double targetWeight = profile.TargetWeight ?? 0;
            double heightM = (profile.Height ?? 0) / 100.0;
            double bmi = (heightM > 0 && currentWeight > 0) ? (currentWeight / (heightM * heightM)) : 0;
            string bmiLevel = bmi < 18.5 ? "Thiếu cân" : bmi < 25 ? "Bình thường" : bmi < 30 ? "Thừa cân" : "Béo phì";

            var report = new HealthReportResponseDto
            {
                Profile_id = profile.Profile_id,
                CurrentWeight = currentWeight,
                TargetWeight = targetWeight,
                BMI = Math.Round(bmi, 1),
                BMICategory = bmiLevel,
                DailyCalories = goal.TargetCalories ?? 0,
                DailyProtein = goal.TargetProtein ?? 0,
                DailyFat = goal.TargetFat ?? 0,
                DailyCarbs = goal.TargetCarbs ?? 0,
                DailyFiber = 25, // default
                DailySugarLimit = 50, // default
                DailySaltLimit = 5, // default
                Goal = profile.Goal,
                EstimatedWeeks = profile.TargetWeeks ?? 12
            };

            // Generate Narrative
            report.CalorieExplanation = $"Dựa trên chỉ số BMR và mức độ vận động, để đạt mục tiêu {GetGoalText(profile.Goal)}, bạn cần tiêu thụ khoảng {Math.Round(goal.TargetCalories ?? 0)} kcal mỗi ngày.";
            report.TimelineExplanation = profile.Goal == "lose" || profile.Goal == "gain"
                ? $"Nếu duy trì chế độ này, dự kiến bạn sẽ đạt mục tiêu {profile.TargetWeight}kg trong khoảng {report.EstimatedWeeks} tuần."
                : "Duy trì chế độ ăn này sẽ giúp bạn giữ được cân nặng và sức khỏe ổn định lâu dài.";
            report.GeneralAdvice = "Đừng quên uống đủ nước (khoảng 2-3 lít mỗi ngày) và duy trì vận động nhẹ nhàng để có kết quả tốt nhất.";

            return report;
        }

        private string GetGoalText(string goal)
        {
            return goal switch
            {
                "lose" => "giảm cân",
                "gain" => "tăng cân",
                "muscle" => "tăng cơ",
                "heart" => "tốt cho tim mạch",
                "diabetes" => "ổn định đường huyết",
                _ => "duy trì cân nặng"
            };
        }
    }
}
