using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.RequestModels
{
    public class GroceryListRequest
    {
        public string Status { get; set; }
        public List<GroceryItemRequest> Items { get; set; }
    }

    public class GroceryListUpdateRequest
    {
        public string Status { get; set; }
        public List<GroceryItemRequest> Items { get; set; }
    }
}
