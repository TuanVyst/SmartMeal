using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeLabelResponseDto
    {
        public Guid Id { get; set; }
        public Guid Rt_Id { get; set; }
        public Guid Recipe_Id { get; set; }
        public bool IsDeleted { get; set; }
    }
}
