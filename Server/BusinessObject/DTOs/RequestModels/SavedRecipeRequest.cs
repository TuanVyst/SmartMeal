using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class SavedRecipeRequest
    {
        public Guid Collection_Id { get; set; }
        public Guid Recipe_Id { get; set; }
    }
}
