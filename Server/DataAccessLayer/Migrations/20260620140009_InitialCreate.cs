using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Account",
                columns: table => new
                {
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Address = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AvatarUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Account", x => x.Account_id);
                });

            migrationBuilder.CreateTable(
                name: "DietPlan",
                columns: table => new
                {
                    Diet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    TargetCalories = table.Column<double>(type: "double precision", nullable: true),
                    MaxCarbs = table.Column<double>(type: "double precision", nullable: true),
                    MaxFat = table.Column<double>(type: "double precision", nullable: true),
                    MinProtein = table.Column<double>(type: "double precision", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietPlan", x => x.Diet_id);
                });

            migrationBuilder.CreateTable(
                name: "Ingredients",
                columns: table => new
                {
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    AveragePrice = table.Column<double>(type: "double precision", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ingredients", x => x.Ingredient_id);
                });

            migrationBuilder.CreateTable(
                name: "IngredientTags",
                columns: table => new
                {
                    It_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngredientTags", x => x.It_id);
                });

            migrationBuilder.CreateTable(
                name: "MedicalCondition",
                columns: table => new
                {
                    Condition_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalCondition", x => x.Condition_id);
                });

            migrationBuilder.CreateTable(
                name: "Partners",
                columns: table => new
                {
                    Partner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Image = table.Column<string>(type: "text", nullable: false),
                    Website = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partners", x => x.Partner_id);
                });

            migrationBuilder.CreateTable(
                name: "Plan",
                columns: table => new
                {
                    Plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Price = table.Column<double>(type: "numeric(18,2)", nullable: false),
                    Duration = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Features = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plan", x => x.Plan_id);
                });

            migrationBuilder.CreateTable(
                name: "Recipe_tag",
                columns: table => new
                {
                    Rt_Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipe_tag", x => x.Rt_Id);
                });

            migrationBuilder.CreateTable(
                name: "BmiLog",
                columns: table => new
                {
                    Log_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Height = table.Column<double>(type: "double precision", nullable: true),
                    Weight = table.Column<double>(type: "double precision", nullable: true),
                    Bmi = table.Column<double>(type: "double precision", nullable: true),
                    BmiLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BmiLog", x => x.Log_id);
                    table.ForeignKey(
                        name: "FK_BmiLog_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Collection",
                columns: table => new
                {
                    Collection_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Collection", x => x.Collection_id);
                    table.ForeignKey(
                        name: "FK_Collection_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Feedback",
                columns: table => new
                {
                    Feedback_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    Rating = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedback", x => x.Feedback_id);
                    table.ForeignKey(
                        name: "FK_Feedback_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroceryLists",
                columns: table => new
                {
                    List_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroceryLists", x => x.List_id);
                    table.ForeignKey(
                        name: "FK_GroceryLists_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HealthProfile",
                columns: table => new
                {
                    Profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Gender = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Height = table.Column<double>(type: "double precision", nullable: true),
                    Weight = table.Column<double>(type: "double precision", nullable: true),
                    ActivityLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Goal = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthProfile", x => x.Profile_id);
                    table.ForeignKey(
                        name: "FK_HealthProfile_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NutritionGoal",
                columns: table => new
                {
                    Goal_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetCalories = table.Column<double>(type: "double precision", nullable: true),
                    TargetProtein = table.Column<double>(type: "double precision", nullable: true),
                    TargetCarbs = table.Column<double>(type: "double precision", nullable: true),
                    TargetFat = table.Column<double>(type: "double precision", nullable: true),
                    TargetFiber = table.Column<double>(type: "double precision", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionGoal", x => x.Goal_id);
                    table.ForeignKey(
                        name: "FK_NutritionGoal_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Recipe",
                columns: table => new
                {
                    Recipe_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Recipe_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Instruction = table.Column<string>(type: "text", nullable: false),
                    CookTime = table.Column<int>(type: "integer", nullable: false),
                    PrepTime = table.Column<int>(type: "integer", nullable: false),
                    Servings = table.Column<int>(type: "integer", nullable: false),
                    Difficulty = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipe", x => x.Recipe_id);
                    table.ForeignKey(
                        name: "FK_Recipe_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDietPlan",
                columns: table => new
                {
                    UDP_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Diet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDietPlan", x => x.UDP_id);
                    table.ForeignKey(
                        name: "FK_UserDietPlan_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserDietPlan_DietPlan_Diet_id",
                        column: x => x.Diet_id,
                        principalTable: "DietPlan",
                        principalColumn: "Diet_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Allergies",
                columns: table => new
                {
                    Allergy_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Allergies", x => x.Allergy_id);
                    table.ForeignKey(
                        name: "FK_Allergies_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Allergies_Ingredients_Ingredient_id",
                        column: x => x.Ingredient_id,
                        principalTable: "Ingredients",
                        principalColumn: "Ingredient_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NutritionalValues",
                columns: table => new
                {
                    Nv_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Calories = table.Column<double>(type: "double precision", nullable: false),
                    Protein = table.Column<double>(type: "double precision", nullable: true),
                    Carbs = table.Column<double>(type: "double precision", nullable: true),
                    Fat = table.Column<double>(type: "double precision", nullable: true),
                    Fiber = table.Column<double>(type: "double precision", nullable: true),
                    Sugar = table.Column<double>(type: "double precision", nullable: true),
                    Salt = table.Column<double>(type: "double precision", nullable: true),
                    Cholesterol = table.Column<double>(type: "double precision", nullable: true),
                    ServingSize = table.Column<double>(type: "double precision", nullable: true),
                    ServingUnit = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionalValues", x => x.Nv_id);
                    table.ForeignKey(
                        name: "FK_NutritionalValues_Ingredients_Ingredient_id",
                        column: x => x.Ingredient_id,
                        principalTable: "Ingredients",
                        principalColumn: "Ingredient_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pantries",
                columns: table => new
                {
                    Pantry_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<double>(type: "double precision", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pantries", x => x.Pantry_id);
                    table.ForeignKey(
                        name: "FK_Pantries_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Pantries_Ingredients_Ingredient_id",
                        column: x => x.Ingredient_id,
                        principalTable: "Ingredients",
                        principalColumn: "Ingredient_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IngredientLabels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    It_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngredientLabels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IngredientLabels_IngredientTags_It_id",
                        column: x => x.It_id,
                        principalTable: "IngredientTags",
                        principalColumn: "It_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IngredientLabels_Ingredients_Ingredient_id",
                        column: x => x.Ingredient_id,
                        principalTable: "Ingredients",
                        principalColumn: "Ingredient_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConditionDietRecommendation",
                columns: table => new
                {
                    Rec_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Condition_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Diet_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConditionDietRecommendation", x => x.Rec_id);
                    table.ForeignKey(
                        name: "FK_ConditionDietRecommendation_DietPlan_Diet_id",
                        column: x => x.Diet_id,
                        principalTable: "DietPlan",
                        principalColumn: "Diet_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConditionDietRecommendation_MedicalCondition_Condition_id",
                        column: x => x.Condition_id,
                        principalTable: "MedicalCondition",
                        principalColumn: "Condition_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserCondition",
                columns: table => new
                {
                    UC_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Condition_id = table.Column<Guid>(type: "uuid", nullable: false),
                    DiagnosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCondition", x => x.UC_id);
                    table.ForeignKey(
                        name: "FK_UserCondition_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCondition_MedicalCondition_Condition_id",
                        column: x => x.Condition_id,
                        principalTable: "MedicalCondition",
                        principalColumn: "Condition_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AffiliateProducts",
                columns: table => new
                {
                    Product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Partner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Link = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<double>(type: "double precision", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AffiliateProducts", x => x.Product_id);
                    table.ForeignKey(
                        name: "FK_AffiliateProducts_Ingredients_Ingredient_id",
                        column: x => x.Ingredient_id,
                        principalTable: "Ingredients",
                        principalColumn: "Ingredient_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AffiliateProducts_Partners_Partner_id",
                        column: x => x.Partner_id,
                        principalTable: "Partners",
                        principalColumn: "Partner_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subscription",
                columns: table => new
                {
                    Sub_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PaymentRef = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscription", x => x.Sub_id);
                    table.ForeignKey(
                        name: "FK_Subscription_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Subscription_Plan_Plan_id",
                        column: x => x.Plan_id,
                        principalTable: "Plan",
                        principalColumn: "Plan_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NutritionLog",
                columns: table => new
                {
                    Log_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    LogDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MealType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Recipe_id = table.Column<Guid>(type: "uuid", nullable: true),
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<double>(type: "double precision", nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TotalCalories = table.Column<double>(type: "double precision", nullable: true),
                    TotalProtein = table.Column<double>(type: "double precision", nullable: true),
                    TotalCarbs = table.Column<double>(type: "double precision", nullable: true),
                    TotalFat = table.Column<double>(type: "double precision", nullable: true),
                    TotalFiber = table.Column<double>(type: "double precision", nullable: true),
                    TotalSugar = table.Column<double>(type: "double precision", nullable: true),
                    TotalSalt = table.Column<double>(type: "double precision", nullable: true),
                    TotalCholesterol = table.Column<double>(type: "double precision", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionLog", x => x.Log_id);
                    table.ForeignKey(
                        name: "FK_NutritionLog_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NutritionLog_Ingredients_Ingredient_id",
                        column: x => x.Ingredient_id,
                        principalTable: "Ingredients",
                        principalColumn: "Ingredient_id");
                    table.ForeignKey(
                        name: "FK_NutritionLog_Recipe_Recipe_id",
                        column: x => x.Recipe_id,
                        principalTable: "Recipe",
                        principalColumn: "Recipe_id");
                });

            migrationBuilder.CreateTable(
                name: "RecipeIngredients",
                columns: table => new
                {
                    RI_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Recipe_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UOM = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeIngredients", x => x.RI_id);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Ingredients_Ingredient_id",
                        column: x => x.Ingredient_id,
                        principalTable: "Ingredients",
                        principalColumn: "Ingredient_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Recipe_Recipe_id",
                        column: x => x.Recipe_id,
                        principalTable: "Recipe",
                        principalColumn: "Recipe_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeLabel",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Rt_Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Recipe_Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeLabel", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipeLabel_Recipe_Recipe_Id",
                        column: x => x.Recipe_Id,
                        principalTable: "Recipe",
                        principalColumn: "Recipe_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeLabel_Recipe_tag_Rt_Id",
                        column: x => x.Rt_Id,
                        principalTable: "Recipe_tag",
                        principalColumn: "Rt_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SavedRecipe",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Collection_Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Recipe_Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedRecipe", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedRecipe_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id");
                    table.ForeignKey(
                        name: "FK_SavedRecipe_Collection_Collection_Id",
                        column: x => x.Collection_Id,
                        principalTable: "Collection",
                        principalColumn: "Collection_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SavedRecipe_Recipe_Recipe_Id",
                        column: x => x.Recipe_Id,
                        principalTable: "Recipe",
                        principalColumn: "Recipe_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroceryItems",
                columns: table => new
                {
                    Item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    List_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Product_id = table.Column<Guid>(type: "uuid", nullable: true),
                    Quantity = table.Column<double>(type: "double precision", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    IsPurchased = table.Column<bool>(type: "boolean", nullable: false),
                    Field = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroceryItems", x => x.Item_id);
                    table.ForeignKey(
                        name: "FK_GroceryItems_AffiliateProducts_Product_id",
                        column: x => x.Product_id,
                        principalTable: "AffiliateProducts",
                        principalColumn: "Product_id");
                    table.ForeignKey(
                        name: "FK_GroceryItems_GroceryLists_List_id",
                        column: x => x.List_id,
                        principalTable: "GroceryLists",
                        principalColumn: "List_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroceryItems_Ingredients_Ingredient_id",
                        column: x => x.Ingredient_id,
                        principalTable: "Ingredients",
                        principalColumn: "Ingredient_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AffiliateProducts_Ingredient_id",
                table: "AffiliateProducts",
                column: "Ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_AffiliateProducts_Partner_id",
                table: "AffiliateProducts",
                column: "Partner_id");

            migrationBuilder.CreateIndex(
                name: "IX_Allergies_Account_id",
                table: "Allergies",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Allergies_Ingredient_id",
                table: "Allergies",
                column: "Ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_BmiLog_Account_id",
                table: "BmiLog",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Collection_Account_id",
                table: "Collection",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_ConditionDietRecommendation_Condition_id",
                table: "ConditionDietRecommendation",
                column: "Condition_id");

            migrationBuilder.CreateIndex(
                name: "IX_ConditionDietRecommendation_Diet_id",
                table: "ConditionDietRecommendation",
                column: "Diet_id");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_Account_id",
                table: "Feedback",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_GroceryItems_Ingredient_id",
                table: "GroceryItems",
                column: "Ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_GroceryItems_List_id",
                table: "GroceryItems",
                column: "List_id");

            migrationBuilder.CreateIndex(
                name: "IX_GroceryItems_Product_id",
                table: "GroceryItems",
                column: "Product_id");

            migrationBuilder.CreateIndex(
                name: "IX_GroceryLists_Account_id",
                table: "GroceryLists",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_HealthProfile_Account_id",
                table: "HealthProfile",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientLabels_Ingredient_id",
                table: "IngredientLabels",
                column: "Ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientLabels_It_id",
                table: "IngredientLabels",
                column: "It_id");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientTags_Name",
                table: "IngredientTags",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NutritionalValues_Ingredient_id",
                table: "NutritionalValues",
                column: "Ingredient_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NutritionGoal_Account_id",
                table: "NutritionGoal",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionLog_Account_id",
                table: "NutritionLog",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionLog_Ingredient_id",
                table: "NutritionLog",
                column: "Ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionLog_Recipe_id",
                table: "NutritionLog",
                column: "Recipe_id");

            migrationBuilder.CreateIndex(
                name: "IX_Pantries_Account_id",
                table: "Pantries",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Pantries_Ingredient_id",
                table: "Pantries",
                column: "Ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_Recipe_Account_id",
                table: "Recipe",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Recipe_tag_Name",
                table: "Recipe_tag",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_Ingredient_id",
                table: "RecipeIngredients",
                column: "Ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_Recipe_id",
                table: "RecipeIngredients",
                column: "Recipe_id");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeLabel_Recipe_Id",
                table: "RecipeLabel",
                column: "Recipe_Id");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeLabel_Rt_Id",
                table: "RecipeLabel",
                column: "Rt_Id");

            migrationBuilder.CreateIndex(
                name: "IX_SavedRecipe_Account_id",
                table: "SavedRecipe",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_SavedRecipe_Collection_Id",
                table: "SavedRecipe",
                column: "Collection_Id");

            migrationBuilder.CreateIndex(
                name: "IX_SavedRecipe_Recipe_Id",
                table: "SavedRecipe",
                column: "Recipe_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_Account_id",
                table: "Subscription",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_Plan_id",
                table: "Subscription",
                column: "Plan_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserCondition_Account_id",
                table: "UserCondition",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserCondition_Condition_id",
                table: "UserCondition",
                column: "Condition_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietPlan_Account_id",
                table: "UserDietPlan",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserDietPlan_Diet_id",
                table: "UserDietPlan",
                column: "Diet_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Allergies");

            migrationBuilder.DropTable(
                name: "BmiLog");

            migrationBuilder.DropTable(
                name: "ConditionDietRecommendation");

            migrationBuilder.DropTable(
                name: "Feedback");

            migrationBuilder.DropTable(
                name: "GroceryItems");

            migrationBuilder.DropTable(
                name: "HealthProfile");

            migrationBuilder.DropTable(
                name: "IngredientLabels");

            migrationBuilder.DropTable(
                name: "NutritionalValues");

            migrationBuilder.DropTable(
                name: "NutritionGoal");

            migrationBuilder.DropTable(
                name: "NutritionLog");

            migrationBuilder.DropTable(
                name: "Pantries");

            migrationBuilder.DropTable(
                name: "RecipeIngredients");

            migrationBuilder.DropTable(
                name: "RecipeLabel");

            migrationBuilder.DropTable(
                name: "SavedRecipe");

            migrationBuilder.DropTable(
                name: "Subscription");

            migrationBuilder.DropTable(
                name: "UserCondition");

            migrationBuilder.DropTable(
                name: "UserDietPlan");

            migrationBuilder.DropTable(
                name: "AffiliateProducts");

            migrationBuilder.DropTable(
                name: "GroceryLists");

            migrationBuilder.DropTable(
                name: "IngredientTags");

            migrationBuilder.DropTable(
                name: "Recipe_tag");

            migrationBuilder.DropTable(
                name: "Collection");

            migrationBuilder.DropTable(
                name: "Recipe");

            migrationBuilder.DropTable(
                name: "Plan");

            migrationBuilder.DropTable(
                name: "MedicalCondition");

            migrationBuilder.DropTable(
                name: "DietPlan");

            migrationBuilder.DropTable(
                name: "Ingredients");

            migrationBuilder.DropTable(
                name: "Partners");

            migrationBuilder.DropTable(
                name: "Account");
        }
    }
}
