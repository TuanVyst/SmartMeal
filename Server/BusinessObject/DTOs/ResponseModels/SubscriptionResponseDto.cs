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
        public DateTime? TransactionDate { get; set; }
        public bool IsDeleted { get; set; }

        // Joined display fields for admin transaction history
        public string AccountName { get; set; }
        public string AccountEmail { get; set; }
        public string PlanName { get; set; }
        public double PlanPrice { get; set; }
    }
}
