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
        public Guid Partner_id { get; set; } = Guid.NewGuid();

        public string Name { get; set; }
        public string Address { get; set; }
        public string Image { get; set; }
        public string Website { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation property: 1 Partner c� nhi?u AffiliateProduct
        public ICollection<AffiliateProduct> AffiliateProducts { get; set; }
    }
}
