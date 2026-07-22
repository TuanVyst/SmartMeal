public class HealthProfileRequest
{
    public Guid Account_id { get; set; }

    public DateTime DateOfBirth { get; set; }

    public string Gender { get; set; }

    public double Height { get; set; }

    public double Weight { get; set; }
    
    public double? TargetWeight { get; set; }
    
    public int? TargetDays { get; set; }

    public string ActivityLevel { get; set; }

    public string Goal { get; set; }
    
    public int? CookingTimeMinutes { get; set; }
    public string? BudgetLevel { get; set; }
    public int? MealsPerDay { get; set; }
    public string? DietType { get; set; }
    public int? PlanCycleDays { get; set; }
}