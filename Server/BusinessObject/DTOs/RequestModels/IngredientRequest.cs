using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.RequestModels
{
    public class IngredientRequest
    {
        public string Name { get; set; }
        public double AveragePrice { get; set; }
        public string ImageUrl { get; set; }
        public List<Guid> IngredientTagIds { get; set; } = new List<Guid>();
    }
}

