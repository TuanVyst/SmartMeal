using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class RatingRequest
    {
        public Guid Recipe_id { get; set; }
        public decimal RatingValue { get; set; }
        public string Review { get; set; }
    }

    public class RatingUpdateRequest
    {
        public decimal? RatingValue { get; set; }
        public string Review { get; set; }
    }
}
