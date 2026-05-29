namespace BusinessObject.Dtos.ResponseModels
{
    public class IngredientTagResponse
    {
        public Guid It_id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
    }
}
