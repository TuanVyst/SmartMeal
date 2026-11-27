using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.RequestModels
{
    public class PromotionRequest
    {
        public string Name { get; set; }
        public double DiscountPercent { get; set; }

        /// <summary>UTC start of the promotion window.</summary>
        public DateTime StartAt { get; set; }

        /// <summary>UTC end of the promotion window.</summary>
        public DateTime EndAt { get; set; }

        public List<Guid> PlanIds { get; set; } = new List<Guid>();
    }
}
