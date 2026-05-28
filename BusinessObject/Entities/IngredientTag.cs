using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class IngredientTag
    {
        [Key]
        public Guid It_id { get; set; } = Guid.NewGuid();

        public string Name { get; set; }

        public string Category { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation property: 1 Tag có thể nằm trong nhiều IngredientLabel
        public ICollection<IngredientLabel> IngredientLabels { get; set; }
    }
}
