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
        public Guid Rating_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; } // Khóa ngoại trỏ tới bảng Account

        [ForeignKey("Recipe")]
        public Guid Recipe_id { get; set; } // Khóa ngoại trỏ tới bảng Recipe

        [Column("Rating")]
        public decimal RatingValue { get; set; }

        public string Review { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
         public Account Account { get; set; }
         public Recipe Recipe { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
