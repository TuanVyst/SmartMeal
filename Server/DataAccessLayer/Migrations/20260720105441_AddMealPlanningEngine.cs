using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddMealPlanningEngine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MealPlan",
                columns: table => new
                {
                    MealPlan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalDays = table.Column<int>(type: "integer", nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlan", x => x.MealPlan_id);
                    table.ForeignKey(
                        name: "FK_MealPlan_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MealPlanDay",
                columns: table => new
                {
                    Day_id = table.Column<Guid>(type: "uuid", nullable: false),
                    MealPlan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    DayIndex = table.Column<int>(type: "integer", nullable: false),
                    DayDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlanDay", x => x.Day_id);
                    table.ForeignKey(
                        name: "FK_MealPlanDay_MealPlan_MealPlan_id",
                        column: x => x.MealPlan_id,
                        principalTable: "MealPlan",
                        principalColumn: "MealPlan_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MealPlanEntry",
                columns: table => new
                {
                    Entry_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Day_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Recipe_id = table.Column<Guid>(type: "uuid", nullable: false),
                    MealSlot = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SlotCalories = table.Column<double>(type: "double precision", nullable: false),
                    SlotProtein = table.Column<double>(type: "double precision", nullable: false),
                    SlotCarbs = table.Column<double>(type: "double precision", nullable: false),
                    SlotFat = table.Column<double>(type: "double precision", nullable: false),
                    SlotFiber = table.Column<double>(type: "double precision", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPlanEntry", x => x.Entry_id);
                    table.ForeignKey(
                        name: "FK_MealPlanEntry_MealPlanDay_Day_id",
                        column: x => x.Day_id,
                        principalTable: "MealPlanDay",
                        principalColumn: "Day_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MealPlanEntry_Recipe_Recipe_id",
                        column: x => x.Recipe_id,
                        principalTable: "Recipe",
                        principalColumn: "Recipe_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MealPlan_Account_id",
                table: "MealPlan",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlanDay_MealPlan_id",
                table: "MealPlanDay",
                column: "MealPlan_id");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlanEntry_Day_id",
                table: "MealPlanEntry",
                column: "Day_id");

            migrationBuilder.CreateIndex(
                name: "IX_MealPlanEntry_Recipe_id",
                table: "MealPlanEntry",
                column: "Recipe_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MealPlanEntry");

            migrationBuilder.DropTable(
                name: "MealPlanDay");

            migrationBuilder.DropTable(
                name: "MealPlan");
        }
    }
}
