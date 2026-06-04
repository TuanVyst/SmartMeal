using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Recipe")]
    public class Recipe
    {
        [Key]
        public Guid Recipe_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Recipe_name { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        public string Instruction { get; set; }

        /// <summary>Cook time in minutes</summary>
        public int CookTime { get; set; }

        /// <summary>Prep time in minutes</summary>
        public int PrepTime { get; set; }

        public int Servings { get; set; }

        /// <summary>easy | medium | hard</summary>
        [MaxLength(20)]
        public string Difficulty { get; set; }

        public bool IsPublic { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual Account Account { get; set; }
        public virtual ICollection<RecipeLabel> RecipeLabels { get; set; }
        public virtual ICollection<SavedRecipe> SavedRecipes { get; set; }
        public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; }
        public virtual ICollection<Rating> Ratings { get; set; }
        public virtual ICollection<Post> Posts { get; set; }
    }
}
