using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddSurveyPreferencesPhase1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BudgetLevel",
                table: "HealthProfile",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CookingTimeMinutes",
                table: "HealthProfile",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DietType",
                table: "HealthProfile",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MealsPerDay",
                table: "HealthProfile",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PlanCycleDays",
                table: "HealthProfile",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BudgetLevel",
                table: "HealthProfile");

            migrationBuilder.DropColumn(
                name: "CookingTimeMinutes",
                table: "HealthProfile");

            migrationBuilder.DropColumn(
                name: "DietType",
                table: "HealthProfile");

            migrationBuilder.DropColumn(
                name: "MealsPerDay",
                table: "HealthProfile");

            migrationBuilder.DropColumn(
                name: "PlanCycleDays",
                table: "HealthProfile");
        }
    }
}
