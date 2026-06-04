using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeTagResponseDto
    {
        public Guid Rt_Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public bool IsDeleted { get; set; }
    }
}
