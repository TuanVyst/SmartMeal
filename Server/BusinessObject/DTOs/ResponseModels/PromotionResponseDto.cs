using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class PromotionResponseDto
    {
        public Guid Promo_id { get; set; }
        public string Name { get; set; }
        public double DiscountPercent { get; set; }

        /// <summary>UTC promotion window start.</summary>
        public DateTime StartAt { get; set; }

        /// <summary>UTC promotion window end.</summary>
        public DateTime EndAt { get; set; }

        public bool IsActive { get; set; }

        /// <summary>"scheduled" | "active" | "expired" | "disabled"</summary>
        public string Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public List<PromotionPlanDto> Plans { get; set; } = new List<PromotionPlanDto>();
    }

    public class PromotionPlanDto
    {
        public Guid Plan_id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public double EffectivePrice { get; set; }
    }
}
