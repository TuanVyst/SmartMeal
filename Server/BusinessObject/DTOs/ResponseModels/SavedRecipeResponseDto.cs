using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class SavedRecipeResponseDto
    {
        public Guid Saved_id { get; set; }
        public Guid Collection_id { get; set; }
        public Guid Recipe_id { get; set; }
        public bool IsDeleted { get; set; }
    }
}
