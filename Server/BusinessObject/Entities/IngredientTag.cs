
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace BusinessObject.Entities
{
    [Table("IngredientTags")]
    public class IngredientTag
    {
        [Key]
        public Guid It_id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        public string Category { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation property: 1 Tag có thể nằm trong nhiều IngredientLabel
        public ICollection<IngredientLabel> IngredientLabels { get; set; }
    }
}
