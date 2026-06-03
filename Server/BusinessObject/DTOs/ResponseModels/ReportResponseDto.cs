using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class ReportResponseDto
    {
        public Guid Report_id { get; set; }
        public Guid Account_id { get; set; }
        public Guid Comment_id { get; set; }
        public Guid Post_id { get; set; }
        public string Content { get; set; }
        public bool IsDeleted { get; set; }
    }
}
