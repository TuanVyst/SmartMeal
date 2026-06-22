using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Collection")]
    public class Collection
    {
        [Key]
        public Guid Collection_id { get; set; } = Guid.NewGuid();

    [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        [MaxLength(200)]
        public string Name { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsPublic { get; set; } = false;

        [NotMapped]

        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual Account Account { get; set; }
        public virtual ICollection<SavedRecipe> SavedRecipes { get; set; }
    }
}
