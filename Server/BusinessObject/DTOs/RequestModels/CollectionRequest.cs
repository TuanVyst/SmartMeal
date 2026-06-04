using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class CollectionRequest
    {
        public Guid Account_id { get; set; }
        public string Name { get; set; }
        public bool IsPublic { get; set; }
    }
}
