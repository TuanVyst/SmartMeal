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
        public Guid Product_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Partner")]
        public Guid Partner_id { get; set; }

        [ForeignKey("Ingredient")]
        public Guid Ingredient_id { get; set; }

        public string Name { get; set; }
        public string Link { get; set; }
        public double Price { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public Partner Partner { get; set; }
        public Ingredient Ingredient { get; set; }
        public ICollection<GroceryItem> GroceryItems { get; set; } = new List<GroceryItem>();
    }
}
