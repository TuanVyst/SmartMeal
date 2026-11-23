using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentEvidenceToSubscription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Subscription_Account_id",
                table: "Subscription");

            migrationBuilder.AddColumn<string>(
                name: "BankReference",
                table: "Subscription",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Subscription",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            migrationBuilder.AddColumn<string>(
                name: "EvidenceSource",
                table: "Subscription",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EvidenceSyncedAt",
                table: "Subscription",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "GrantedByAccountId",
                table: "Subscription",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "Subscription",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentDescription",
                table: "Subscription",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentLinkId",
                table: "Subscription",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentProvider",
                table: "Subscription",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProviderStatus",
                table: "Subscription",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RawEvidence",
                table: "Subscription",
                type: "text",
                nullable: true);

            // ---- backfill: legacy rows use their service start as the row creation time ----
            migrationBuilder.Sql("UPDATE \"Subscription\" SET \"CreatedAt\" = \"StartDate\";");

            // ---- backfill: classify existing rows as PayOS payments or admin grants ----
            // PaidAt / BankReference / PaymentLinkId are intentionally left NULL (no fake evidence).
            migrationBuilder.Sql(
                "UPDATE \"Subscription\" SET \"PaymentProvider\" = CASE " +
                "WHEN \"PaymentRef\" LIKE 'ADMIN_GRANT_%' THEN 'AdminGrant' ELSE 'PayOS' END " +
                "WHERE \"PaymentProvider\" IS NULL;");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_Account_id_Status",
                table: "Subscription",
                columns: new[] { "Account_id", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_GrantedByAccountId",
                table: "Subscription",
                column: "GrantedByAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_PaymentRef",
                table: "Subscription",
                column: "PaymentRef");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_Status_CreatedAt",
                table: "Subscription",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_Subscription_Account_GrantedByAccountId",
                table: "Subscription",
                column: "GrantedByAccountId",
                principalTable: "Account",
                principalColumn: "Account_id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscription_Account_GrantedByAccountId",
                table: "Subscription");

            migrationBuilder.DropIndex(
                name: "IX_Subscription_Account_id_Status",
                table: "Subscription");

            migrationBuilder.DropIndex(
                name: "IX_Subscription_GrantedByAccountId",
                table: "Subscription");

            migrationBuilder.DropIndex(
                name: "IX_Subscription_PaymentRef",
                table: "Subscription");

            migrationBuilder.DropIndex(
                name: "IX_Subscription_Status_CreatedAt",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "BankReference",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "EvidenceSource",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "EvidenceSyncedAt",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "GrantedByAccountId",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "PaymentDescription",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "PaymentLinkId",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "PaymentProvider",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "ProviderStatus",
                table: "Subscription");

            migrationBuilder.DropColumn(
                name: "RawEvidence",
                table: "Subscription");

            migrationBuilder.CreateIndex(
                name: "IX_Subscription_Account_id",
                table: "Subscription",
                column: "Account_id");
        }
    }
}
