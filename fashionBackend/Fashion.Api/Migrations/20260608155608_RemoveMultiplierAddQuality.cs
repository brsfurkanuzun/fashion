using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fashion.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMultiplierAddQuality : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ToolPricingVariants");

            migrationBuilder.DropIndex(
                name: "IX_ToolDefinitions_ToolKey",
                table: "ToolDefinitions");

            migrationBuilder.DropColumn(
                name: "Multiplier",
                table: "ToolDefinitions");

            migrationBuilder.AddColumn<string>(
                name: "Quality",
                table: "ToolDefinitions",
                type: "character varying(4)",
                maxLength: 4,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ToolDefinitions_ToolKey_Quality",
                table: "ToolDefinitions",
                columns: new[] { "ToolKey", "Quality" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ToolDefinitions_ToolKey_Quality",
                table: "ToolDefinitions");

            migrationBuilder.DropColumn(
                name: "Quality",
                table: "ToolDefinitions");

            migrationBuilder.AddColumn<decimal>(
                name: "Multiplier",
                table: "ToolDefinitions",
                type: "numeric(6,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "ToolPricingVariants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BaseCost = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Label = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    ParamKey = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    ToolKey = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ToolPricingVariants", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ToolDefinitions_ToolKey",
                table: "ToolDefinitions",
                column: "ToolKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ToolPricingVariants_ToolKey",
                table: "ToolPricingVariants",
                column: "ToolKey");

            migrationBuilder.CreateIndex(
                name: "IX_ToolPricingVariants_ToolKey_ParamKey",
                table: "ToolPricingVariants",
                columns: new[] { "ToolKey", "ParamKey" },
                unique: true);
        }
    }
}
