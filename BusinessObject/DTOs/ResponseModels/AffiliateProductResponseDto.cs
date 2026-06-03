using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class AffiliateProductResponseDto
    {
        public Guid Product_id { get; set; }
        public Guid Partner_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public string Name { get; set; }
        public string Link { get; set; }
        public double Price { get; set; }
        public bool IsDeleted { get; set; }
        public PartnerSimpleDto Partner { get; set; }
        public IngredientSimpleDto Ingredient { get; set; }
    }

    public class PartnerSimpleDto
    {
        public Guid Partner_id { get; set; }
        public string Name { get; set; }
    }

    public class IngredientSimpleDto
    {
        public Guid Ingredient_id { get; set; }
        public string Name { get; set; }
        public double AveragePrice { get; set; }
        public string ImageUrl { get; set; }
    }
}

