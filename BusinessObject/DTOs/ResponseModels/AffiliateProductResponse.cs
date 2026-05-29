namespace BusinessObject.Dtos.ResponseModels
{
    public class AffiliateProductResponse
    {
        public Guid Product_id { get; set; }
        public Guid Partner_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public double Price { get; set; }
        public bool IsDeleted { get; set; }
    }
}
