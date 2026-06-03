using System;

namespace BusinessObject.Dtos.ResponseModels
{
    public class AllergyResponseDto
    {
        public Guid Allergy_id { get; set; }
        public Guid Ingredient_id { get; set; }
        public Guid Account_id { get; set; }
        public bool IsDeleted { get; set; }
    }
}
