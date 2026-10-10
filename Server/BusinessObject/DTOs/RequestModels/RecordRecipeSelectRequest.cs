using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos.RequestModels
{
    public class RecordRecipeSelectRequest
    {
        [Required]
        [MaxLength(128)]
        public string SessionToken { get; set; } = string.Empty;

        public Guid? RecipeId { get; set; }
    }
}
