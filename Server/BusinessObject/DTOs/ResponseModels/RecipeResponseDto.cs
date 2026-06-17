using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class RecipeResponseDto
    {
        public Guid Recipe_id { get; set; }
        public Guid Account_id { get; set; }
        public string Recipe_name { get; set; }
        public string Description { get; set; }
        public string Instruction { get; set; }
        public int CookTime { get; set; }
        public int PrepTime { get; set; }
        public int Servings { get; set; }
        public string Difficulty { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }

        public ICollection<RecipeLabelSimpleDto> RecipeLabels { get; set; }
    }

    public class RecipeLabelSimpleDto
    {
        public Guid Label_id { get; set; }
        public string LabelName { get; set; }
    }
}
