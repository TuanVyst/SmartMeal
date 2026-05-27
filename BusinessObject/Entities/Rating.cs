using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class Rating
    {
        [Key]
        public int Rating_id { get; set; }

        public int Account_id { get; set; } // Khóa ngoại trỏ tới bảng Account

        public int Recipe_id { get; set; } // Khóa ngoại trỏ tới bảng Recipe

        [Column("Rating")]
        public decimal RatingValue { get; set; }

        public string Review { get; set; }

        // Navigation properties
        // public Account Account { get; set; }
        // public Recipe Recipe { get; set; }
    }
}
