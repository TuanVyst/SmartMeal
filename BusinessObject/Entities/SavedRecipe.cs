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
            public int Id { get; set; }

            [ForeignKey("Collection")]
            public int Collection_Id { get; set; }

            [ForeignKey("Recipe")]
            public int Recipe_Id { get; set; }

            // Navigation properties
            public virtual Collection Collection { get; set; }
            public virtual Recipe Recipe { get; set; }
        }
    }

