using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fashion.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalAuthAndPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AppleSub",
                table: "Users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleSub",
                table: "Users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PaymentOrders",
                columns: table => new
                {
                    MerchantOid = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageKey = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    PaymentAmountMinor = table.Column<int>(type: "integer", nullable: false),
                    CreditsToGrant = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentOrders", x => x.MerchantOid);
                    table.ForeignKey(
                        name: "FK_PaymentOrders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_AppleSub",
                table: "Users",
                column: "AppleSub",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleSub",
                table: "Users",
                column: "GoogleSub",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentOrders_UserId",
                table: "PaymentOrders",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentOrders");

            migrationBuilder.DropIndex(
                name: "IX_Users_AppleSub",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_GoogleSub",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AppleSub",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GoogleSub",
                table: "Users");
        }
    }
}
