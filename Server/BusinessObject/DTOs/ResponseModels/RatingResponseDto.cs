using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RatingResponseDto
    {
        public Guid Rating_id { get; set; }
        public Guid Account_id { get; set; }
        public Guid Recipe_id { get; set; }
        public decimal RatingValue { get; set; }
        public string Review { get; set; }
        public bool IsDeleted { get; set; }
    }
}
