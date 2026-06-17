using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueTagNameIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ratings");

            migrationBuilder.DropTable(
                name: "Report");

            migrationBuilder.DropTable(
                name: "Comment");

            migrationBuilder.DropTable(
                name: "Post");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "IngredientTags",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Recipe_tag_Name",
                table: "Recipe_tag",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IngredientTags_Name",
                table: "IngredientTags",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Recipe_tag_Name",
                table: "Recipe_tag");

            migrationBuilder.DropIndex(
                name: "IX_IngredientTags_Name",
                table: "IngredientTags");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "IngredientTags",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateTable(
                name: "Post",
                columns: table => new
                {
                    Post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Image = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Recipe_id = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Post", x => x.Post_id);
                    table.ForeignKey(
                        name: "FK_Post_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Post_Recipe_Recipe_id",
                        column: x => x.Recipe_id,
                        principalTable: "Recipe",
                        principalColumn: "Recipe_id");
                });

            migrationBuilder.CreateTable(
                name: "Ratings",
                columns: table => new
                {
                    Rating_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Recipe_id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Rating = table.Column<decimal>(type: "numeric", nullable: false),
                    Review = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ratings", x => x.Rating_id);
                    table.ForeignKey(
                        name: "FK_Ratings_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ratings_Recipe_Recipe_id",
                        column: x => x.Recipe_id,
                        principalTable: "Recipe",
                        principalColumn: "Recipe_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comment",
                columns: table => new
                {
                    Comment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentCommentComment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsEdited = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comment", x => x.Comment_id);
                    table.ForeignKey(
                        name: "FK_Comment_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comment_Comment_ParentCommentComment_id",
                        column: x => x.ParentCommentComment_id,
                        principalTable: "Comment",
                        principalColumn: "Comment_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comment_Post_Post_id",
                        column: x => x.Post_id,
                        principalTable: "Post",
                        principalColumn: "Post_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Report",
                columns: table => new
                {
                    Report_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Comment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Report", x => x.Report_id);
                    table.ForeignKey(
                        name: "FK_Report_Account_Account_id",
                        column: x => x.Account_id,
                        principalTable: "Account",
                        principalColumn: "Account_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Report_Comment_Comment_id",
                        column: x => x.Comment_id,
                        principalTable: "Comment",
                        principalColumn: "Comment_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Report_Post_Post_id",
                        column: x => x.Post_id,
                        principalTable: "Post",
                        principalColumn: "Post_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comment_Account_id",
                table: "Comment",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_ParentCommentComment_id",
                table: "Comment",
                column: "ParentCommentComment_id");

            migrationBuilder.CreateIndex(
                name: "IX_Comment_Post_id",
                table: "Comment",
                column: "Post_id");

            migrationBuilder.CreateIndex(
                name: "IX_Post_Account_id",
                table: "Post",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Post_Recipe_id",
                table: "Post",
                column: "Recipe_id");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_Account_id",
                table: "Ratings",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_Recipe_id",
                table: "Ratings",
                column: "Recipe_id");

            migrationBuilder.CreateIndex(
                name: "IX_Report_Account_id",
                table: "Report",
                column: "Account_id");

            migrationBuilder.CreateIndex(
                name: "IX_Report_Comment_id",
                table: "Report",
                column: "Comment_id");

            migrationBuilder.CreateIndex(
                name: "IX_Report_Post_id",
                table: "Report",
                column: "Post_id");
        }
    }
}
