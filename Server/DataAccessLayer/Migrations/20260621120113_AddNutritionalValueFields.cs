using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddNutritionalValueFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Carbohydrates",
                table: "NutritionalValues",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Cholesterol",
                table: "NutritionalValues",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Fat",
                table: "NutritionalValues",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Fiber",
                table: "NutritionalValues",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Protein",
                table: "NutritionalValues",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Sodium",
                table: "NutritionalValues",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Sugar",
                table: "NutritionalValues",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Carbohydrates",
                table: "NutritionalValues");

            migrationBuilder.DropColumn(
                name: "Cholesterol",
                table: "NutritionalValues");

            migrationBuilder.DropColumn(
                name: "Fat",
                table: "NutritionalValues");

            migrationBuilder.DropColumn(
                name: "Fiber",
                table: "NutritionalValues");

            migrationBuilder.DropColumn(
                name: "Protein",
                table: "NutritionalValues");

            migrationBuilder.DropColumn(
                name: "Sodium",
                table: "NutritionalValues");

            migrationBuilder.DropColumn(
                name: "Sugar",
                table: "NutritionalValues");
        }
    }
}
