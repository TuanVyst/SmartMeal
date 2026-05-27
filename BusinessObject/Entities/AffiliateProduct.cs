using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class AffiliateProduct
    {
        [Key]
        public int Product_id { get; set; }

        [ForeignKey("Partner")]
        public int Partner_id { get; set; }

        [ForeignKey("Ingredient")]
        public int Ingredient_id { get; set; }

        public string Name { get; set; }
        public string Link { get; set; }
        public double Price { get; set; }

        // Navigation properties
        public Partner Partner { get; set; }
        public Ingredient Ingredient { get; set; }
        public ICollection<GroceryItem> GroceryItems { get; set; } = new List<GroceryItem>();
    }
}
