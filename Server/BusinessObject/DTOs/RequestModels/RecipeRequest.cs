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
        public List<Guid> RecipeTagIds { get; set; } = new List<Guid>();
    }
}
