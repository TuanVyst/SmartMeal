using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class DietPlanResponseDto
    {
        public Guid Diet_id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public double TargetCalories { get; set; }

        public double MaxCarbs { get; set; }

        public double MaxFat { get; set; }

        public double MinProtein { get; set; }

        public bool IsDeleted { get; set; }
    }
}