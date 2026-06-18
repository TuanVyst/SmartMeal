using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class UserDietPlanRequest
    {
        public Guid Account_id { get; set; }
        public Guid Diet_id { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
