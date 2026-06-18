using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddNutritionLogFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "TotalCarbs",
                table: "NutritionLog",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalCholesterol",
                table: "NutritionLog",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalFat",
                table: "NutritionLog",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalFiber",
                table: "NutritionLog",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalProtein",
                table: "NutritionLog",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalSodium",
                table: "NutritionLog",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalSugar",
                table: "NutritionLog",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalCarbs",
                table: "NutritionLog");

            migrationBuilder.DropColumn(
                name: "TotalCholesterol",
                table: "NutritionLog");

            migrationBuilder.DropColumn(
                name: "TotalFat",
                table: "NutritionLog");

            migrationBuilder.DropColumn(
                name: "TotalFiber",
                table: "NutritionLog");

            migrationBuilder.DropColumn(
                name: "TotalProtein",
                table: "NutritionLog");

            migrationBuilder.DropColumn(
                name: "TotalSodium",
                table: "NutritionLog");

            migrationBuilder.DropColumn(
                name: "TotalSugar",
                table: "NutritionLog");
        }
    }
}
