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
    }
}
