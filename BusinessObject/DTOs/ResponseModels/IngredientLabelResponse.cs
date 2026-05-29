namespace BusinessObject.Dtos.ResponseModels
{
    public class IngredientLabelResponse
    {
        public Guid Id { get; set; }
        public Guid It_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public bool IsDeleted { get; set; }
    }
}
