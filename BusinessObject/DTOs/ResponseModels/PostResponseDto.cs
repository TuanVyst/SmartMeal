using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class PostResponseDto
    {
        public Guid Post_id { get; set; }
        public Guid Account_id { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public bool IsDeleted { get; set; }
    }
}
