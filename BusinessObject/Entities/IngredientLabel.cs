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
        public int Id { get; set; }

        [ForeignKey("Ingredient_tag")]
        public int It_id { get; set; }

        [ForeignKey("Ingredient")]
        public int Ingredient_id { get; set; }

        // Navigation properties
        public IngredientTag Ingredient_tag { get; set; }
        public Ingredient Ingredient { get; set; }
    }
}
