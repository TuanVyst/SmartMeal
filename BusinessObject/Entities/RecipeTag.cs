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
        public int Rt_Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(50)]
        public string Type { get; set; }

        // Navigation properties
        public virtual ICollection<RecipeLabel> RecipeLabels { get; set; }
    }
}
