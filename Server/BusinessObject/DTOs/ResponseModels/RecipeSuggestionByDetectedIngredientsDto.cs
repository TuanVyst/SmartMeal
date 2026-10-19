
using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeSuggestionByDetectedIngredientsDto
    {
        public Guid RecipeId { get; set; }
        public string RecipeName { get; set; } = string.Empty;

        public List<string> MatchedIngredients { get; set; } = new();
        public List<string> MissingIngredients { get; set; } = new();

        public int MissingCount { get; set; }
        public double MatchPercentage { get; set; }
    }
}
