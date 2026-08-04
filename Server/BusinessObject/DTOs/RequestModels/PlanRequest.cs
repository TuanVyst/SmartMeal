using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class PlanRequest
    {
        public string Name { get; set; }
        public double Price { get; set; }
        public int Duration { get; set; }
        public int Tier { get; set; } = 1;
        public string Description { get; set; }
        public string Features { get; set; }
    }
}
