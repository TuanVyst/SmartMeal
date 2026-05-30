using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class GroceryListResponse
    {
        public Guid List_id { get; set; }
        public Guid Account_id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public List<GroceryItemResponse> Items { get; set; }
    }
}
