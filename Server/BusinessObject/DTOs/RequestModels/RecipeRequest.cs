using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.RequestModels
{
    public class RecipeRequest
    {
        public Guid Account_id { get; set; }
        public string Recipe_name { get; set; }
        public string Description { get; set; }
        public string Instruction { get; set; }
        public int CookTime { get; set; }
        public int PrepTime { get; set; }
        public int Servings { get; set; }
        public string Difficulty { get; set; }
        public bool IsPublic { get; set; }
        public string? ImageUrl { get; set; }
        public List<Guid> RecipeTagIds { get; set; } = new List<Guid>();
        public List<RecipeIngredientItemRequest>? Ingredients { get; set; }
    }

    public class RecipeIngredientItemRequest
    {
        public Guid Ingredient_id { get; set; }
        public int Quantity { get; set; }
        public string UOM { get; set; } = "g";
        public bool IsPrimary { get; set; }
    }
}
