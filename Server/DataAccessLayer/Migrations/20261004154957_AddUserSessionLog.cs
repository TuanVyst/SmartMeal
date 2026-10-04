using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSessionLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS ""UserSessionLog"" CASCADE;");

            migrationBuilder.CreateTable(
                name: "UserSessionLog",
                columns: table => new
                {
                    Session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: true),
                    SessionToken = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastHeartbeat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSessionLog", x => x.Session_id);
                    table.ForeignKey(
                        name: "FK_UserSessionLog_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserSessionLog_Account_id",
                table: "UserSessionLog",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessionLog_SessionToken",
                table: "UserSessionLog",
                column: "SessionToken");

            migrationBuilder.CreateIndex(
                name: "IX_UserSessionLog_StartTime",
                table: "UserSessionLog",
                column: "StartTime");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSessionLog");
        }
    }
}
