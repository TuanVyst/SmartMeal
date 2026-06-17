public class DietPlanRequest
{
    public string Name { get; set; }

    public string Description { get; set; }

    public double TargetCalories { get; set; }

    public double MaxCarbs { get; set; }

    public double MaxFat { get; set; }

    public double MinProtein { get; set; }
}