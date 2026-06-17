public class HealthProfileRequest
{
    public Guid Account_id { get; set; }

    public DateTime DateOfBirth { get; set; }

    public string Gender { get; set; }

    public double Height { get; set; }

    public double Weight { get; set; }

    public string ActivityLevel { get; set; }

    public string Goal { get; set; }
}