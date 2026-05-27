using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace BusinessObject.Entities
{
    [Table("Post")]
    public class Post
    {
        [Key]
        public int Post_id { get; set; }

        [ForeignKey("Account")]
        public int Account_id { get; set; }

        [MaxLength(2000)]
        public string Description { get; set; }

        [MaxLength(500)]
        public string Image { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>active | hidden | removed</summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        // Navigation properties
        public virtual Account Account { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<Report> Reports { get; set; }
    }
}
