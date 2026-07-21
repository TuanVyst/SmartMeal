using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class HealthReportResponseDto
    {
        public Guid Profile_id { get; set; }
        
        public double CurrentWeight { get; set; }
        public double TargetWeight { get; set; }
        public double BMI { get; set; }
        public string BMICategory { get; set; }

        public double DailyCalories { get; set; }
        public double DailyProtein { get; set; }
        public double DailyFat { get; set; }
        public double DailyCarbs { get; set; }
        public double DailyFiber { get; set; }
        public double DailySugarLimit { get; set; }
        public double DailySaltLimit { get; set; }

        public int EstimatedWeeks { get; set; }
        public string Goal { get; set; }
        
        // Narrative explanations for UI
        public string CalorieExplanation { get; set; }
        public string TimelineExplanation { get; set; }
        public string GeneralAdvice { get; set; }
    }
}
