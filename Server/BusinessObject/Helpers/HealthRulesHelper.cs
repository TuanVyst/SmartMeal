using System;
using System.Collections.Generic;
using BusinessObject.Entities;

namespace BusinessObject.Helpers
{
    public static class HealthRulesHelper
    {
        private const int SAFE_DEFICIT_MAX = 1000;
        private const int SAFE_MIN_CALORIES_MALE = 1500;
        private const int SAFE_MIN_CALORIES_FEMALE = 1200;
        private const double BMR_FLOOR_RATIO = 0.9;

        public static double GetActivityFactor(string? activityLevel)
        {
            if (string.IsNullOrEmpty(activityLevel)) return 1.2;
            var level = activityLevel.ToLower().Replace("-", "_");
            if (level == "sedentary" || level.Contains("ít")) return 1.2;
            if (level == "light" || level.Contains("nhẹ")) return 1.375;
            if (level == "moderate" || level.Contains("vừa") || level.Contains("trung bình")) return 1.55;
            if (level == "active" || level.Contains("nhiều") || (level.Contains("nặng") && !level.Contains("rất"))) return 1.725;
            if (level == "very_active" || level.Contains("rất") || level.Contains("very")) return 1.9;
            return 1.2;
        }

        public static double ComputeCalorieDelta(double currentWeight, double targetWeight, int days)
        {
            if (currentWeight <= 0 || targetWeight <= 0 || days <= 0) return 0;
            double weightDiff = targetWeight - currentWeight;
            double totalKcal = weightDiff * 7700;
            double dailyDelta = totalKcal / days;
            return Math.Max(-SAFE_DEFICIT_MAX, Math.Min(SAFE_DEFICIT_MAX, dailyDelta));
        }

        public class DailyTargets
        {
            public double Calories { get; set; }
            public double Protein { get; set; }
            public double Carbs { get; set; }
            public double Fat { get; set; }
            public double Fiber { get; set; }
            public double SugarLimit { get; set; }
            public double SaltLimit { get; set; }
        }

        public static DailyTargets CalculateDailyTargets(HealthProfile profile, List<string> conditions)
        {
            double bmr = 0;
            double tdee = 2000;
            
            if (profile.Weight > 0 && profile.Height > 0)
            {
                int age = 30;
                if (profile.DateOfBirth.HasValue)
                {
                    var dob = profile.DateOfBirth.Value;
                    var today = DateTime.UtcNow;
                    age = today.Year - dob.Year;
                    if (today.Month < dob.Month || (today.Month == dob.Month && today.Day < dob.Day))
                    {
                        age--;
                    }
                }

                string g = (profile.Gender ?? "").ToLower();
                if (g == "male" || g == "nam")
                {
                    bmr = (10 * profile.Weight.Value) + (6.25 * profile.Height.Value) - (5 * age) + 5;
                }
                else if (g == "female" || g == "nữ")
                {
                    bmr = (10 * profile.Weight.Value) + (6.25 * profile.Height.Value) - (5 * age) - 161;
                }
                else
                {
                    bmr = (10 * profile.Weight.Value) + (6.25 * profile.Height.Value) - (5 * age) - 78;
                }

                double activityFactor = GetActivityFactor(profile.ActivityLevel);
                tdee = bmr * activityFactor;
            }

            double maintenance = tdee;
            
            string gender = (profile.Gender ?? "").ToLower();
            bool isFemale = gender == "female" || gender == "nữ";
            double safeMinCalories = isFemale ? SAFE_MIN_CALORIES_FEMALE : SAFE_MIN_CALORIES_MALE;
            double bmrFloor = bmr > 0 ? bmr * BMR_FLOOR_RATIO : safeMinCalories;
            double absoluteFloor = Math.Max(safeMinCalories, bmrFloor);

            double rawTargetCalories = maintenance;
            double rawDeficit = 0;

            string goal = profile.Goal ?? "maintain";
            if (goal == "lose" || goal == "gain")
            {
                if (profile.Weight > 0 && profile.TargetWeight > 0)
                {
                    int days = Math.Max(1, profile.TargetDays ?? 84);
                    rawDeficit = ComputeCalorieDelta(profile.Weight.Value, profile.TargetWeight.Value, days);
                }
                else
                {
                    rawDeficit = goal == "lose" ? -500 : 0;
                }
                rawTargetCalories = maintenance + rawDeficit;
            }

            double finalCalories = rawTargetCalories;
            if (finalCalories < absoluteFloor)
            {
                finalCalories = absoluteFloor;
            }

            if (goal == "gain" && finalCalories > maintenance + SAFE_DEFICIT_MAX)
            {
                finalCalories = maintenance + SAFE_DEFICIT_MAX;
            }

            double kcal = Math.Round(finalCalories);

            double targetProteinPct = 0.20;
            double targetCarbsPct = 0.50;
            double targetFatPct = 0.30;

            bool hasDiabetes = conditions.Contains("diabetes");
            bool hasGout = conditions.Contains("gout");
            bool hasHypertension = conditions.Contains("hypertension");
            bool hasHeartDisease = conditions.Contains("heartDisease");
            bool hasCholesterol = conditions.Contains("cholesterol");

            if (hasDiabetes)
            {
                targetCarbsPct = 0.40;
                targetProteinPct = 0.25;
                targetFatPct = 0.35;
            }

            if (hasGout)
            {
                if (!hasDiabetes) targetCarbsPct = 0.55;
                targetProteinPct = Math.Min(targetProteinPct, 0.15);
                targetFatPct = 1.0 - targetCarbsPct - targetProteinPct;
            }

            if ((hasHypertension || hasHeartDisease || hasCholesterol) && !hasDiabetes && !hasGout)
            {
                targetCarbsPct = 0.52;
                targetProteinPct = 0.20;
                targetFatPct = 0.28;
            }

            double total = targetCarbsPct + targetProteinPct + targetFatPct;
            double proteinPct = targetProteinPct / total;
            double carbsPct = targetCarbsPct / total;
            double fatPct = targetFatPct / total;

            double sugarLimit = hasDiabetes ? 25 : 50;
            double saltLimit = hasHypertension ? 1.5 : (hasHeartDisease ? 1.5 : 5);

            return new DailyTargets
            {
                Calories = kcal,
                Protein = Math.Round(kcal * proteinPct / 4),
                Carbs = Math.Round(kcal * carbsPct / 4),
                Fat = Math.Round(kcal * fatPct / 9),
                Fiber = 25,
                SugarLimit = sugarLimit,
                SaltLimit = saltLimit
            };
        }
    }
}
