using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("RecipeLabel")]
    public class RecipeLabel
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("RecipeTag")]
        public Guid Rt_Id { get; set; }

        [ForeignKey("Recipe")]
        public Guid Recipe_Id { get; set; }

        [NotMapped]

        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual RecipeTag RecipeTag { get; set; }
        public virtual Recipe Recipe { get; set; }
    }
}
