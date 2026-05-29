namespace BusinessObject.Dtos.ResponseModels
{
    public class IngredientResponse
    {
        public Guid Ingredient_id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double AveragePrice { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
    }
}
