using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeSelectTrackingToUserSessionLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FirstRecipeSelectTime",
                table: "UserSessionLog",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FirstRecipe_id",
                table: "UserSessionLog",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeToFirstRecipeSelectSeconds",
                table: "UserSessionLog",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSessionLog_FirstRecipe_id",
                table: "UserSessionLog",
                column: "FirstRecipe_id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserSessionLog_Recipe_FirstRecipe_id",
                table: "UserSessionLog",
                column: "FirstRecipe_id",
                principalTable: "Recipe",
                principalColumn: "Recipe_id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserSessionLog_Recipe_FirstRecipe_id",
                table: "UserSessionLog");

            migrationBuilder.DropIndex(
                name: "IX_UserSessionLog_FirstRecipe_id",
                table: "UserSessionLog");

            migrationBuilder.DropColumn(
                name: "FirstRecipeSelectTime",
                table: "UserSessionLog");

            migrationBuilder.DropColumn(
                name: "FirstRecipe_id",
                table: "UserSessionLog");

            migrationBuilder.DropColumn(
                name: "TimeToFirstRecipeSelectSeconds",
                table: "UserSessionLog");
        }
    }
}
