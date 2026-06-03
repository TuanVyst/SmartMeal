using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class PlanResponseDto
    {
        public Guid Plan_id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public int Duration { get; set; }
        public string Description { get; set; }
        public string Features { get; set; }
        public bool IsDeleted { get; set; }
    }
}
