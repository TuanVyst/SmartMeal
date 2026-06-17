using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class UserConditionResponseDto
    {
        public Guid UC_id { get; set; }

        public Guid Account_id { get; set; }

        public Guid Condition_id { get; set; }

        public DateTime DiagnosedAt { get; set; }

        public string Notes { get; set; }

        public bool IsDeleted { get; set; }

        public UserConditionAccountDto Account { get; set; }

        public UserConditionMedicalConditionDto MedicalCondition { get; set; }
    }

    public class UserConditionAccountDto
    {
        public Guid Account_id { get; set; }

        public string Username { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }
    }

    public class UserConditionMedicalConditionDto
    {
        public Guid Condition_id { get; set; }

        public string Name { get; set; }

        public string Category { get; set; }
    }
}