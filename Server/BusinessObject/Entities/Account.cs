using BusinessObject.Enums;
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
        public Guid Account_id { get; set; } = Guid.NewGuid();

     
        public RoleEnum Role { get; set; } = RoleEnum.User;

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
    
        public virtual UserInformation UserInformation { get; set; }
        public virtual ICollection<Subscription> Subscriptions { get; set; }
        public virtual ICollection<Recipe> Recipes { get; set; }
        public virtual ICollection<GroceryList> GroceryLists { get; set; }
        public virtual ICollection<Pantry> Pantries { get; set; }
        public virtual ICollection<SavedRecipe> SavedRecipes { get; set; }
        public virtual ICollection<Rating> Ratings { get; set; }
        public virtual ICollection<Post> Posts { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<Collection> Collections { get; set; }
        public virtual ICollection<Report> Reports { get; set; }

    }
}
