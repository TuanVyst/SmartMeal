using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeLabelResponse
    {
        public Guid Id { get; set; }
        public Guid Rt_Id { get; set; }
        public Guid Recipe_Id { get; set; }
    }
}
