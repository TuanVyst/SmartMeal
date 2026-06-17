using BusinessObject.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        // UserInformation fields merged directly into Account
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        // Navigation properties
        public virtual ICollection<Subscription> Subscriptions { get; set; }
        public virtual ICollection<Recipe> Recipes { get; set; }
        public virtual ICollection<GroceryList> GroceryLists { get; set; }
        public virtual ICollection<Pantry> Pantries { get; set; }
        public virtual ICollection<SavedRecipe> SavedRecipes { get; set; }

        public virtual ICollection<Collection> Collections { get; set; }
    
    }
}
