using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos.RequestModels
{
    public class RatingRequest
    {
        public Guid Recipe_id { get; set; }
        [Range(0.5, 5.0)]
        public decimal RatingValue { get; set; }
        public string Review { get; set; }
    }

    public class RatingUpdateRequest
    {
        public decimal? RatingValue { get; set; }
        public string Review { get; set; }
    }
}
