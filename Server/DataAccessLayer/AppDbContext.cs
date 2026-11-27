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
        public DbSet<BmiLog> BmiLogs { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<PromotionPlan> PromotionPlans { get; set; }
        
        // Meal Planning Engine
        public DbSet<MealPlan> MealPlans { get; set; }
        public DbSet<MealPlanDay> MealPlanDays { get; set; }
        public DbSet<MealPlanEntry> MealPlanEntries { get; set; }
        // Activity & Session Tracking
        public DbSet<UserSessionLog> UserSessionLogs { get; set; }
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

            modelBuilder.Entity<BusinessObject.Entities.Allergy>()
                .HasIndex(a => new { a.Account_id, a.IsDeleted });

            modelBuilder.Entity<BusinessObject.Entities.UserSessionLog>()
                .HasIndex(s => s.SessionToken);

            modelBuilder.Entity<BusinessObject.Entities.UserSessionLog>()
                .HasIndex(s => s.StartTime);

            modelBuilder.Entity<BusinessObject.Entities.UserSessionLog>()
                .HasOne(s => s.FirstRecipe)
                .WithMany()
                .HasForeignKey(s => s.FirstRecipe_id)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.Account)
                .WithMany()
                .HasForeignKey(f => f.Account_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.RepliedByAccount)
                .WithMany()
                .HasForeignKey(f => f.RepliedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // ----- Subscription -----
            // Explicit relationships: Subscription has two Account navigations (owner + admin grantor),
            // so the owner relationship must be configured explicitly to avoid ambiguity.
            modelBuilder.Entity<BusinessObject.Entities.Subscription>()
                .HasOne(s => s.Account)
                .WithMany(a => a.Subscriptions)
                .HasForeignKey(s => s.Account_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BusinessObject.Entities.Subscription>()
                .HasOne(s => s.GrantedByAccount)
                .WithMany()
                .HasForeignKey(s => s.GrantedByAccountId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<BusinessObject.Entities.Subscription>()
                .HasIndex(s => s.PaymentRef);

            modelBuilder.Entity<BusinessObject.Entities.Subscription>()
                .HasIndex(s => new { s.Status, s.CreatedAt });

            modelBuilder.Entity<BusinessObject.Entities.Subscription>()
                .HasIndex(s => new { s.Account_id, s.Status });

            modelBuilder.Entity<BusinessObject.Entities.Subscription>()
                .HasOne(s => s.Promotion)
                .WithMany()
                .HasForeignKey(s => s.PromotionId)
                .OnDelete(DeleteBehavior.SetNull);

            // ----- Promotions -----
            modelBuilder.Entity<BusinessObject.Entities.Promotion>()
                .HasIndex(p => new { p.StartAt, p.EndAt });

            modelBuilder.Entity<BusinessObject.Entities.PromotionPlan>()
                .HasKey(pp => new { pp.Promo_id, pp.Plan_id });

            modelBuilder.Entity<BusinessObject.Entities.PromotionPlan>()
                .HasOne(pp => pp.Promotion)
                .WithMany(p => p.PromotionPlans)
                .HasForeignKey(pp => pp.Promo_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BusinessObject.Entities.PromotionPlan>()
                .HasOne(pp => pp.Plan)
                .WithMany()
                .HasForeignKey(pp => pp.Plan_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BusinessObject.Entities.PromotionPlan>()
                .HasIndex(pp => pp.Plan_id);
        }
    }
}
