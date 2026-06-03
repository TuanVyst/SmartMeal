using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class RatingRequest
    {
        public Guid Account_id { get; set; }
        public Guid Recipe_id { get; set; }
        public decimal RatingValue { get; set; }
        public string Review { get; set; }
    }
}
