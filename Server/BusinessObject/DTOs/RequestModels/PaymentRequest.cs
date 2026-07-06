using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class PaymentRequest
    {
        public Guid Account_id { get; set; }
        public Guid Plan_id { get; set; }
    }
}
