
using System.Collections.Generic;

namespace BusinessObject.Dtos.RequestModels
{
    public class DetectedIngredientRequest
    {
        public List<DetectedIngredientDto> Ingredients { get; set; } = new();
    }

    public class DetectedIngredientDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
