using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class Allergy
    {
        [Key]
        public Guid Allergy_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Ingredient")]
        public Guid Ingredient_id { get; set; }

        [ForeignKey("Account")]
        public Guid Account_id { get; set; } // Khóa ngoại trỏ tới bảng Account

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

        // Navigation properties
         public Ingredient Ingredient { get; set; }
         public Account Account { get; set; }
    }
}
