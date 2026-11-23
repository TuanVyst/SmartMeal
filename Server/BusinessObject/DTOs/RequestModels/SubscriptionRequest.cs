using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class SubscriptionRequest
    {
        public Guid Account_id { get; set; }
        public Guid Plan_id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public string PaymentRef { get; set; }
        public double PricePaid { get; set; }

        // ---- Payment evidence (optional, supplied by the payment flow) ----
        /// <summary>"PayOS" | "AdminGrant". Defaults to "PayOS".</summary>
        public string? PaymentProvider { get; set; }
        public string? PaymentLinkId { get; set; }
        public string? PaymentDescription { get; set; }
    }

    public class AdminGrantSubscriptionRequest
    {
        public Guid Account_id { get; set; }
        public Guid Plan_id { get; set; }
        public string? PaymentRef { get; set; }
        public double? PricePaid { get; set; }

        /// <summary>Admin account performing the grant (set from JWT by the controller).</summary>
        public Guid? GrantedByAccountId { get; set; }
    }
}
