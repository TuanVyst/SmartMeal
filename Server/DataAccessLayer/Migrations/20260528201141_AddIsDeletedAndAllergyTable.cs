using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDeletedAndAllergyTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Allergy_Account_Account_id",
                table: "Allergy");

            migrationBuilder.DropForeignKey(
                name: "FK_Allergy_Ingredients_Ingredient_id",
                table: "Allergy");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Allergy",
                table: "Allergy");

            migrationBuilder.RenameTable(
                name: "Allergy",
                newName: "Allergies");

            migrationBuilder.RenameIndex(
                name: "IX_Allergy_Ingredient_id",
                table: "Allergies",
                newName: "IX_Allergies_Ingredient_id");

            migrationBuilder.RenameIndex(
                name: "IX_Allergy_Account_id",
                table: "Allergies",
                newName: "IX_Allergies_Account_id");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Ratings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Ratings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Partners",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Pantries",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "IngredientTags",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "IngredientTags",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Ingredients",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "IngredientLabels",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "GroceryLists",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "GroceryItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AffiliateProducts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Allergies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Allergies",
                table: "Allergies",
                column: "Allergy_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Allergies_Account_Account_id",
                table: "Allergies",
                column: "Account_id",
                principalTable: "Account",
                principalColumn: "Account_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Allergies_Ingredients_Ingredient_id",
                table: "Allergies",
                column: "Ingredient_id",
                principalTable: "Ingredients",
                principalColumn: "Ingredient_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Allergies_Account_Account_id",
                table: "Allergies");

            migrationBuilder.DropForeignKey(
                name: "FK_Allergies_Ingredients_Ingredient_id",
                table: "Allergies");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Allergies",
                table: "Allergies");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Pantries");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "IngredientTags");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "IngredientTags");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "IngredientLabels");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "GroceryLists");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "GroceryItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AffiliateProducts");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Allergies");

            migrationBuilder.RenameTable(
                name: "Allergies",
                newName: "Allergy");

            migrationBuilder.RenameIndex(
                name: "IX_Allergies_Ingredient_id",
                table: "Allergy",
                newName: "IX_Allergy_Ingredient_id");

            migrationBuilder.RenameIndex(
                name: "IX_Allergies_Account_id",
                table: "Allergy",
                newName: "IX_Allergy_Account_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Allergy",
                table: "Allergy",
                column: "Allergy_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Allergy_Account_Account_id",
                table: "Allergy",
                column: "Account_id",
                principalTable: "Account",
                principalColumn: "Account_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Allergy_Ingredients_Ingredient_id",
                table: "Allergy",
                column: "Ingredient_id",
                principalTable: "Ingredients",
                principalColumn: "Ingredient_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
