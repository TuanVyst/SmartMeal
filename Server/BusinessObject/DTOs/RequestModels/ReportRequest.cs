using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class ReportRequest
    {
        public Guid Account_id { get; set; }
        public Guid Comment_id { get; set; }
        public Guid Post_id { get; set; }
        public string Content { get; set; }
    }
}
