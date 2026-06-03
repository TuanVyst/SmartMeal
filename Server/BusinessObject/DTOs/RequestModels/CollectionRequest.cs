using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos.RequestModels
{
    public class CollectionRequest
    {
        public Guid Account_id { get; set; }

        [MaxLength(200)]
        public string Name { get; set; }

        public bool IsPublic { get; set; } = false;
    }
}
