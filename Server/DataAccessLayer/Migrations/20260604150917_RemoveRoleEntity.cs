using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class RemoveRoleEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Account_Role_Role_id",
                table: "Account");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropIndex(
                name: "IX_Account_Role_id",
                table: "Account");

            migrationBuilder.DropColumn(
                name: "Role_id",
                table: "Account");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Role_id",
                table: "Account",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    Role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.Role_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Account_Role_id",
                table: "Account",
                column: "Role_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Account_Role_Role_id",
                table: "Account",
                column: "Role_id",
                principalTable: "Role",
                principalColumn: "Role_id");
        }
    }
}
