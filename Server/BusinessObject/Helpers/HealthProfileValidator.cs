using System;

namespace BusinessObject.Helpers
{
    /// <summary>
    /// Authoritative bounds for health metrics.
    /// Keep in sync with Client/src/utils/healthConstraints.js and
    /// ClientMobile/lib/core/validators/health_validators.dart.
    /// </summary>
    public static class HealthProfileValidator
    {
        public const int MinAge = 10;
        public const int MaxAge = 120;

        public const double MinHeight = 100;
        public const double MaxHeight = 250;

        public const double MinWeight = 20;
        public const double MaxWeight = 300;

        public const double MinTargetWeight = 20;
        public const double MaxTargetWeight = 300;

        public const int MinTargetDays = 14;
        public const int MaxTargetDays = 730;

        public const double MinBmi = 10;
        public const double MaxBmi = 80;

        public static int? GetAge(DateTime? dateOfBirth)
        {
            if (!dateOfBirth.HasValue) return null;
            var today = DateTime.UtcNow.Date;
            var dob = dateOfBirth.Value.Date;
            var age = today.Year - dob.Year;
            if (today.Month < dob.Month || (today.Month == dob.Month && today.Day < dob.Day)) age--;
            return age;
        }

        public static string? ValidateMetrics(double? height, double? weight, int? age)
        {
            if (age.HasValue && (age.Value < MinAge || age.Value > MaxAge))
                return $"Tuổi phải là số nguyên từ {MinAge} đến {MaxAge}";

            if (!height.HasValue || !double.IsFinite(height.Value) || height.Value < MinHeight || height.Value > MaxHeight)
                return $"Chiều cao phải từ {MinHeight:0} đến {MaxHeight:0} cm";

            if (!weight.HasValue || !double.IsFinite(weight.Value) || weight.Value < MinWeight || weight.Value > MaxWeight)
                return $"Cân nặng phải từ {MinWeight:0} đến {MaxWeight:0} kg";

            var bmi = weight.Value / Math.Pow(height.Value / 100, 2);
            if (!double.IsFinite(bmi) || bmi < MinBmi || bmi > MaxBmi)
                return "Chiều cao và cân nặng không khớp nhau, vui lòng kiểm tra lại";

            return null;
        }

        public static string? ValidateTarget(double? targetWeight, double? weight, string? goal)
        {
            if (goal != "lose" && goal != "gain") return null;

            if (!targetWeight.HasValue || !double.IsFinite(targetWeight.Value)
                || targetWeight.Value < MinTargetWeight || targetWeight.Value > MaxTargetWeight)
                return $"Cân nặng mục tiêu phải từ {MinTargetWeight:0} đến {MaxTargetWeight:0} kg";

            if (!weight.HasValue) return null;

            if (goal == "lose" && targetWeight.Value >= weight.Value)
                return "Cân nặng mục tiêu khi giảm cân phải nhỏ hơn cân nặng hiện tại";

            if (goal == "gain" && targetWeight.Value <= weight.Value)
                return "Cân nặng mục tiêu khi tăng cơ phải lớn hơn cân nặng hiện tại";

            return null;
        }

        public static string? ValidateTargetDays(int? targetDays)
        {
            if (!targetDays.HasValue || targetDays.Value < MinTargetDays || targetDays.Value > MaxTargetDays)
                return $"Số ngày mục tiêu phải là số nguyên từ {MinTargetDays} đến {MaxTargetDays}";
            return null;
        }

        public static string? ValidateAll(
            double? height,
            double? weight,
            int? age,
            double? targetWeight,
            string? goal,
            int? targetDays)
        {
            var error = ValidateMetrics(height, weight, age);
            if (error != null) return error;

            error = ValidateTarget(targetWeight, weight, goal);
            if (error != null) return error;

            if (goal == "lose" || goal == "gain")
            {
                error = ValidateTargetDays(targetDays);
                if (error != null) return error;
            }

            return null;
        }
    }
}
