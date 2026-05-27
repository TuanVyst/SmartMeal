using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    public class Partner
    {
        [Key]
        public int Partner_id { get; set; }

        public string Name { get; set; }
        public string Address { get; set; }
        public string Image { get; set; }
        public string Website { get; set; }
        public bool IsActive { get; set; }

        // Navigation property: 1 Partner có nhiều AffiliateProduct
        public ICollection<AffiliateProduct> AffiliateProducts { get; set; }
    }
}
