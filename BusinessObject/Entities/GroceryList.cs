using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class GroceryList
    {
        [Key]
        public int List_id { get; set; }

        public int Account_id { get; set; } // Khóa ngoại trỏ tới bảng Account

        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }

        // Navigation properties
        public ICollection<GroceryItem> GroceryItems { get; set; }
        // public Account Account { get; set; }
    }
}
