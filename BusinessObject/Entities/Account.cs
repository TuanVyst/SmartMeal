using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Account")]
    public class Account
    {
        [Key]
        public int Account_id { get; set; }

        [ForeignKey("Role")]
        public int Role_id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; }

        [Required]
        [MaxLength(255)]
        public string Password { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        public DateTime? LastLogin { get; set; }

        // Navigation properties
        public virtual Role Role { get; set; }
        public virtual UserInformation UserInformation { get; set; }
        public virtual ICollection<Subscription> Subscriptions { get; set; }
    }
}
