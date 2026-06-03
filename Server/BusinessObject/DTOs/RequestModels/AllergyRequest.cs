using System;

namespace BusinessObject.Dtos.RequestModels
{
    public class AllergyRequest
    {
        public Guid Ingredient_id { get; set; }
        public Guid Account_id { get; set; }
    }
}
