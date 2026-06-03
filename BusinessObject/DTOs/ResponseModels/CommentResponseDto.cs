using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class CommentResponseDto
    {
        public Guid Comment_id { get; set; }
        public Guid Post_id { get; set; }
        public Guid Account_id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsEdited { get; set; }
        public bool IsDeleted { get; set; }
    }
}
