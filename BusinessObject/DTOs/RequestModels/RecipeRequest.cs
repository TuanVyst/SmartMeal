using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos.RequestModels
{
    public class RecipeRequest
    {
        public Guid Account_id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Recipe_name { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        public string Instruction { get; set; }

        public int CookTime { get; set; }

        public int PrepTime { get; set; }

        public int Servings { get; set; }

        [MaxLength(20)]
        public string Difficulty { get; set; }

        public bool IsPublic { get; set; } = true;
    }
}
