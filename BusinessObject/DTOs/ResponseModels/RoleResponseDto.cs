using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RoleResponseDto
    {
        public Guid Role_id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsDeleted { get; set; }
    }
}
