using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtUpdatedAtToAllergy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AddedAt",
                table: "Pantries",
                newName: "CreatedAt");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Ratings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "GroceryLists",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "GroceryItems",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "GroceryItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Allergies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Allergies",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "GroceryLists");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "GroceryItems");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "GroceryItems");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Allergies");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Allergies");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Pantries",
                newName: "AddedAt");
        }
    }
}
