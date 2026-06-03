using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class PostRequest
    {
        public Guid Account_id { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public string Status { get; set; }
    }
}
