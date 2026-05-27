using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Comment")]
    public class Comment
    {
        [Key]
        public Guid Comment_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Post")]
        public Guid Post_id { get; set; }
        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        [Required]
        public string Content { get; set; }

        /// <summary>Null if top-level comment, set if reply</summary>
        /// 
     

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsEdited { get; set; } = false;

        // Navigation properties
        public virtual Post Post { get; set; }

       
        public virtual Comment ParentComment { get; set; }
        public virtual Account Account { get; set; }
        public virtual ICollection<Comment> Replies { get; set; }
        public virtual ICollection<Report> Reports { get; set; }
    }
}
