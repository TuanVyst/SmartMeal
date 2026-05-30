using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class AllergyResponse
    {
        public Guid Allergy_id { get; set; }
        public Guid Account_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public string IngredientName { get; set; }
    }
}
