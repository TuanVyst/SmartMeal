using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class SubscriptionResponseDto
    {
        public Guid Sub_id { get; set; }
        public Guid Account_id { get; set; }
        public Guid Plan_id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public string PaymentRef { get; set; }
        public double PricePaid { get; set; }
        public bool IsDeleted { get; set; }

        // ---- Transaction metadata (non-breaking additions) ----
        public DateTime? CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? PaymentProvider { get; set; }
        public string? ProviderStatus { get; set; }
    }
}
