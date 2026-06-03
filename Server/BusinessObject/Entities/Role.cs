using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Role")]
    public class Role
    {
        [Key]
        public Guid Role_id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [MaxLength(255)]
        public string Description { get; set; }

        // Navigation properties
        public virtual ICollection<Account> Accounts { get; set; }
    }
}
