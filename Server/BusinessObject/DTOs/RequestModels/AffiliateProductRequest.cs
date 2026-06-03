namespace BusinessObject.Dtos.RequestModels
{
    public class AffiliateProductRequest
    {
        public Guid Partner_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public string Name { get; set; }
        public string Link { get; set; }
        public double Price { get; set; }
    }
}

