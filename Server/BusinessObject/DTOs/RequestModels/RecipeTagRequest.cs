using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos.RequestModels
{
    public class RecipeTagRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(50)]
        public string Type { get; set; }
    }
}
