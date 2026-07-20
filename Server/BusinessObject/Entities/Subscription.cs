using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Subscription")]
    public class Subscription
    {
        [Key]
        public Guid Sub_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        [ForeignKey("Plan")]
        public Guid Plan_id { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        /// <summary>
        /// active | expired | cancelled
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; }

        [MaxLength(255)]
        public string PaymentRef { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public double PricePaid { get; set; } = 0;

        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual Account Account { get; set; }
        public virtual Plan Plan { get; set; }
    }
}
