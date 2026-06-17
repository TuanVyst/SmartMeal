using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.RequestModels
{
    public class IngredientRequest
    {
        public string Name { get; set; }
        public double AveragePrice { get; set; }
        public string ImageUrl { get; set; }
        // Provide one or more tag ids as a list (GUID strings)
        public System.Collections.Generic.List<string> IngredientTagIds { get; set; }
    }
}

