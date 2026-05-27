using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Report")]
    public class Report
    {
        [Key]
        public int Report_id { get; set; }

        [ForeignKey("Comment")]
        public int Comment_id { get; set; }

        [ForeignKey("Post")]
        public int Post_id { get; set; }

        [Required]
        public string Content { get; set; }

        // Navigation properties
        public virtual Comment Comment { get; set; }
        public virtual Post Post { get; set; }
    }
}
