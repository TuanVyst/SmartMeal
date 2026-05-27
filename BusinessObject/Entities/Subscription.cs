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
        public int Sub_id { get; set; }

        [ForeignKey("Account")]
        public int Account_id { get; set; }

        [ForeignKey("Plan")]
        public int Plan_id { get; set; }

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

        // Navigation properties
        public virtual Account Account { get; set; }
        public virtual Plan Plan { get; set; }
    }
}
