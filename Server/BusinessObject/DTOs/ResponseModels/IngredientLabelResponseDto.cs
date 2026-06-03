using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class IngredientLabelResponseDto
    {
        public Guid Label_id { get; set; }
        public Guid Tag_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public bool IsDeleted { get; set; }

        public IngredientTagSimpleDto Ingredient_tag { get; set; }
        public IngredientSimpleDto Ingredient { get; set; }
    }

    public class IngredientTagSimpleDto
    {
        public Guid Tag_id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
    }
}

