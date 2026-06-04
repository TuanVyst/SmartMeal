using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class IngredientTagResponseDto
    {
        public Guid Tag_id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public bool IsDeleted { get; set; }
    }
}

