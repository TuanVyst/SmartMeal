using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class CollectionResponseDto
    {
        public Guid Collection_id { get; set; }
        public Guid Account_id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsPublic { get; set; }
        public bool IsDeleted { get; set; }
    }
}
