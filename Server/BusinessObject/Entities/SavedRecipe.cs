using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    
        [Table("SavedRecipe")]
        public class SavedRecipe
        {
            [Key]
            public Guid Id { get; set; } = Guid.NewGuid();

            [ForeignKey("Collection")]
            public Guid Collection_Id { get; set; }

            [ForeignKey("Recipe")]
            public Guid Recipe_Id { get; set; }

                        public bool IsDeleted { get; set; } = false;

        // Navigation properties
            public virtual Collection Collection { get; set; }
            public virtual Recipe Recipe { get; set; }
        }
    }

