using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class CollectionResponse
    {
        public Guid Collection_id { get; set; }
        public Guid Account_id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsPublic { get; set; }
    }
}
