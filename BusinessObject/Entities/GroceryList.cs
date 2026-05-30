using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class GroceryList
    {
        [Key]
        public Guid List_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; } // Khóa ngoại trỏ tới bảng Account

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public ICollection<GroceryItem> GroceryItems { get; set; }
        public Account Account { get; set; }
    }
}
