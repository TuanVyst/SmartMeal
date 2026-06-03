using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class GroceryListRequest
    {
        public Guid Account_id { get; set; }
        public string Status { get; set; }
    }
}
