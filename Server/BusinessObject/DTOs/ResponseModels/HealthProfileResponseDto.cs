using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class HealthProfileResponseDto
    {
        public Guid Profile_id { get; set; }

        public Guid Account_id { get; set; }

        public DateTime DateOfBirth { get; set; }

        public string Gender { get; set; }

        public double Height { get; set; }

        public double Weight { get; set; }

        public string ActivityLevel { get; set; }

        public string Goal { get; set; }

        public DateTime UpdatedAt { get; set; }

        public bool IsDeleted { get; set; }

        public AccountSimpleDto Account { get; set; }
    }

    public class AccountSimpleDto
    {
        public Guid Account_id { get; set; }

        public string Username { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }
    }
}