using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Recipe_tag")]
    public class RecipeTag
    {
        [Key]
        public Guid Rt_Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(50)]
        public string Type { get; set; }

                public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual ICollection<RecipeLabel> RecipeLabels { get; set; }
    }
}
