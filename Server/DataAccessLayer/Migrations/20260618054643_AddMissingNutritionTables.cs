using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingNutritionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create DietPlan table
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

            // Create MedicalCondition table
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

            // Create HealthProfile table (FK -> Account)
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

            // Create NutritionGoal table (FK -> Account)
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

            // Create UserDietPlan table (FK -> Account, DietPlan)
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

            // Create ConditionDietRecommendation table (FK -> MedicalCondition, DietPlan)
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

            // Create UserCondition table (FK -> Account, MedicalCondition)
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

            // Create NutritionLog table (FK -> Account, Recipe, Ingredients)
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

            // Create indexes for the new tables
            migrationBuilder.CreateIndex(
                name: "IX_ConditionDietRecommendation_Condition_id",
                table: "ConditionDietRecommendation",
                column: "Condition_id");

            migrationBuilder.CreateIndex(
                name: "IX_ConditionDietRecommendation_Diet_id",
                table: "ConditionDietRecommendation",
                column: "Diet_id");

            migrationBuilder.CreateIndex(
                name: "IX_HealthProfile_Account_id",
                table: "HealthProfile",
                column: "Account_id");

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
            migrationBuilder.DropTable(name: "ConditionDietRecommendation");
            migrationBuilder.DropTable(name: "HealthProfile");
            migrationBuilder.DropTable(name: "NutritionGoal");
            migrationBuilder.DropTable(name: "NutritionLog");
            migrationBuilder.DropTable(name: "UserCondition");
            migrationBuilder.DropTable(name: "UserDietPlan");
            migrationBuilder.DropTable(name: "DietPlan");
            migrationBuilder.DropTable(name: "MedicalCondition");
        }
    }
}
