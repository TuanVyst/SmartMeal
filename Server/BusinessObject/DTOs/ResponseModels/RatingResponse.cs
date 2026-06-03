using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RatingResponse
    {
        public Guid Rating_id { get; set; }
        public Guid Account_id { get; set; }
        public string AccountUsername { get; set; }
        public Guid Recipe_id { get; set; }
        public string RecipeName { get; set; }
        public decimal RatingValue { get; set; }
        public string Review { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
