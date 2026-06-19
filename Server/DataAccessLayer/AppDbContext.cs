using BusinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
 
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<RecipeLabel> RecipeLabels { get; set; }
        public DbSet<RecipeTag> RecipeTags { get; set; }
        public DbSet<RecipeIngredient> RecipeIngredients { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<IngredientTag> IngredientTags { get; set; }
        public DbSet<IngredientLabel> IngredientLabels { get; set; }
        public DbSet<NutritionalValue> NutritionalValues { get; set; }
        public DbSet<AffiliateProduct> AffiliateProducts { get; set; }
        public DbSet<HealthProfile> HealthProfiles { get; set; }
        public DbSet<MedicalCondition> MedicalConditions { get; set; }
        public DbSet<UserCondition> UserConditions { get; set; }
        public DbSet<DietPlan> DietPlans { get; set; }
        public DbSet<UserDietPlan> UserDietPlans { get; set; }
        public DbSet<ConditionDietRecommendation> ConditionDietRecommendations { get; set; }
        public DbSet<NutritionGoal> NutritionGoals { get; set; }
        public DbSet<NutritionLog> NutritionLogs { get; set; }
        public DbSet<GroceryList> GroceryLists { get; set; }
        public DbSet<GroceryItem> GroceryItems { get; set; }
        public DbSet<Pantry> Pantries { get; set; }
        public DbSet<Partner> Partners { get; set; }
        public DbSet<Collection> Collections { get; set; }
        public DbSet<SavedRecipe> SavedRecipes { get; set; }
  
        public DbSet<Allergy> Allergies { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
     

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure entity relationships and keys here as needed.
            // Add unique indices for tag names
            modelBuilder.Entity<BusinessObject.Entities.IngredientTag>()
                .HasIndex(t => t.Name)
                .IsUnique();

            modelBuilder.Entity<BusinessObject.Entities.RecipeTag>()
                .HasIndex(t => t.Name)
                .IsUnique();
        }
    }
}
