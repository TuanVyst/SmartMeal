using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class Pantry
    {
        [Key]
        public Guid Pantry_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; } // Khóa ngoại trỏ tới bảng Account

        [ForeignKey("Ingredient")]
        public Guid Ingredient_id { get; set; }

        public double Quantity { get; set; }
        public string Unit { get; set; }

        public DateTime ExpiryDate { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
         public Ingredient Ingredient { get; set; }
         public Account Account { get; set; }
    }
}
