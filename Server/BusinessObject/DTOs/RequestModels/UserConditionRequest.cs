public class UserConditionRequest
{
    public Guid Account_id { get; set; }

    public Guid Condition_id { get; set; }

    public DateTime DiagnosedAt { get; set; }

    public string Notes { get; set; }
}