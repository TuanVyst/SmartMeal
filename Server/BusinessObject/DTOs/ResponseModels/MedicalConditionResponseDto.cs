using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class MedicalConditionResponseDto
    {
        public Guid Condition_id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string Category { get; set; }

        public bool IsDeleted { get; set; }
    }
}