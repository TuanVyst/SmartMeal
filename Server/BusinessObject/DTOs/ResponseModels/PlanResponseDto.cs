using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class PlanResponseDto
    {
        public Guid Plan_id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public int Duration { get; set; }
        public int Tier { get; set; }
        public string Description { get; set; }
        public string Features { get; set; }
        public bool IsDeleted { get; set; }

        // ---- Promotion pricing (computed server-side, UTC timestamps) ----

        /// <summary>Price actually charged right now. Equals <see cref="Price"/> when no promotion is active.</summary>
        public double EffectivePrice { get; set; }

        /// <summary>Applied discount percentage; 0 when no promotion is active.</summary>
        public double SalePercent { get; set; }

        public Guid? PromotionId { get; set; }
        public string? PromotionName { get; set; }
        public DateTime? SaleStartAt { get; set; }
        public DateTime? SaleEndAt { get; set; }
        public bool IsOnSale { get; set; }
    }
}
