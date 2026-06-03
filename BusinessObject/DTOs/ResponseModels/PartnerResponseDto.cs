using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class PartnerResponseDto
    {
        public Guid Partner_id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Image { get; set; }
        public string Website { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}

