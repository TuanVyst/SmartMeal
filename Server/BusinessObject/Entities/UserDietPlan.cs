using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Entities
{
    [Table("UserDietPlan")]
    public class UserDietPlan
    {
        [Key]
        public Guid UDP_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        [ForeignKey("DietPlan")]
        public Guid Diet_id { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public virtual Account Account { get; set; }
        public virtual DietPlan DietPlan { get; set; }
    }
}
