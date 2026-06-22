using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class IngredientLabel
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("Ingredient_tag")]
        public Guid It_id { get; set; }

        [ForeignKey("Ingredient")]
        public Guid Ingredient_id { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public IngredientTag Ingredient_tag { get; set; }
        public Ingredient Ingredient { get; set; }
    }
}