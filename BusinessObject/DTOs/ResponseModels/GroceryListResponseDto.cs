using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class GroceryListResponseDto
    {
        public Guid List_id { get; set; }
        public Guid Account_id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public bool IsDeleted { get; set; }
    }
}
