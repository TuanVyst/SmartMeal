using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class RecipeLabelRequest
    {
        public Guid Rt_Id { get; set; }
        public Guid Recipe_Id { get; set; }
    }
}
