using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddTargetWeight : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "TargetCholesterol",
                table: "NutritionGoal",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TargetSalt",
                table: "NutritionGoal",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TargetSugar",
                table: "NutritionGoal",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TargetWeight",
                table: "HealthProfile",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TargetCholesterol",
                table: "NutritionGoal");

            migrationBuilder.DropColumn(
                name: "TargetSalt",
                table: "NutritionGoal");

            migrationBuilder.DropColumn(
                name: "TargetSugar",
                table: "NutritionGoal");

            migrationBuilder.DropColumn(
                name: "TargetWeight",
                table: "HealthProfile");
        }
    }
}
