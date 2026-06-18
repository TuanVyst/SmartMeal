using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class ConditionDietRecommendationRequest
    {
        public Guid Condition_id { get; set; }
        public Guid Diet_id { get; set; }
        public int Priority { get; set; }
        public string? Notes { get; set; }
    }
}
