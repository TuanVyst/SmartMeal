using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeSuggestionResponseDto
    {
        public Guid Recipe_id { get; set; }
        public string Recipe_name { get; set; }
        public string Description { get; set; }
        public int CookTime { get; set; }
        public int PrepTime { get; set; }
        public string Difficulty { get; set; }
        public double MatchPercentage { get; set; }
        public List<string> MissingIngredients { get; set; } = new List<string>();
        public List<IngredientStatusDto> AllIngredients { get; set; } = new List<IngredientStatusDto>();
    }

    public class IngredientStatusDto
    {
        public string Name { get; set; }
        public bool Possessed { get; set; }
        public bool IsPrimary { get; set; }
    }
}
