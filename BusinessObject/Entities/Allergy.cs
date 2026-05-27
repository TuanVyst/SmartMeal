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
        public int Allergy_id { get; set; }

        [ForeignKey("Ingredient")]
        public int Ingredient_id { get; set; }

        public int Account_id { get; set; } // Khóa ngoại trỏ tới bảng Account

        // Navigation properties
        // public Ingredient Ingredient { get; set; }
        // public Account Account { get; set; }
    }
}
