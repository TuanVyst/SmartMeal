using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class CommentRequest
    {
        public Guid Post_id { get; set; }
        public Guid Account_id { get; set; }
        public string Content { get; set; }
    }
}
