using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddAllergyAccountIsDeletedIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Allergies_Account_id",
                table: "Allergies");

            migrationBuilder.CreateIndex(
                name: "IX_Allergies_Account_id_IsDeleted",
                table: "Allergies",
                columns: new[] { "Account_id", "IsDeleted" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Allergies_Account_id_IsDeleted",
                table: "Allergies");

            migrationBuilder.CreateIndex(
                name: "IX_Allergies_Account_id",
                table: "Allergies",
                column: "Account_id");
        }
    }
}
