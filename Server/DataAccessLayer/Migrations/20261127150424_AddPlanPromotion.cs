using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanPromotion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DiscountPercent",
                table: "Subscription",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "OriginalPrice",
                table: "Subscription",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<Guid>(
                name: "PromotionId",
                table: "Subscription",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Promotion",
                columns: table => new
                {
                    Promo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DiscountPercent = table.Column<double>(type: "numeric(5,2)", nullable: false),
                    StartAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByAccountId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promotion", x => x.Promo_id);
                });

            migrationBuilder.CreateTable(
                name: "Promotion_plan",
                columns: table => new
                {
                    Promo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Plan_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promotion_plan", x => new { x.Promo_id, x.Plan_id });
                    table.ForeignKey(
                        name: "FK_Promotion_plan_Plan_Plan_id",
                        column: x => x.Plan_id,
                        principalTable: "Plan",
                        principalColumn: "Plan_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Promotion_plan_Promotion_Promo_id",
                        column: x => x.Promo_id,
                        principalTable: "Promotion",
                        principalColumn: "Promo_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_PromotionId",
                table: "Subscription",
                column: "PromotionId");

            migrationBuilder.CreateIndex(
                name: "IX_Promotion_StartAt_EndAt",
                table: "Promotion",
                columns: new[] { "StartAt", "EndAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Promotion_plan_Plan_id",
                table: "Promotion_plan",
                column: "Plan_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscription_Promotion_PromotionId",
                table: "Subscription",
                column: "PromotionId",
                principalTable: "Promotion",
                principalColumn: "Promo_id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscription_Promotion_PromotionId",
                table: "Subscription");

            migrationBuilder.DropTable(
                name: "Promotion_plan");

            migrationBuilder.DropTable(
                name: "Promotion");

            migrationBuilder.DropIndex(
                name: "IX_Subscription_PromotionId",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "DiscountPercent",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "OriginalPrice",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "PromotionId",
                table: "Subscription");
        }
    }
}
