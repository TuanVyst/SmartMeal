using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class GroceryItem
    {
        [Key]
        public Guid Item_id { get; set; } = Guid.NewGuid();

        [ForeignKey("GroceryList")]
        public Guid List_id { get; set; }

        [ForeignKey("Ingredient")]
        public Guid Ingredient_id { get; set; }

        [ForeignKey("AffiliateProduct")] // Dựa theo tên Product_id
        public Guid? Product_id { get; set; }

        public double Quantity { get; set; }
        public string Unit { get; set; }
        public bool IsPurchased { get; set; }

        // Thuộc tính Field có kiểu "Type" trong sơ đồ, thường sẽ map thành string
        public string Field { get; set; }

        // Navigation properties
        public GroceryList GroceryList { get; set; }
         public Ingredient Ingredient { get; set; }
         public AffiliateProduct AffiliateProduct { get; set; }

    }
}
