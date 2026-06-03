using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class PlanRequest
    {
        public string Name { get; set; }
        public double Price { get; set; }
        public int Duration { get; set; }
        public string Description { get; set; }
        public string Features { get; set; }
    }
}
