using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class SavedRecipeResponse
    {
        public Guid Id { get; set; }
        public Guid Collection_Id { get; set; }
        public Guid Recipe_Id { get; set; }
    }
}
