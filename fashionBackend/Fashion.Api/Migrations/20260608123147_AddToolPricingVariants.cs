using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fashion.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddToolPricingVariants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ToolPricingVariants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ToolKey = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    ParamKey = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Label = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    BaseCost = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ToolPricingVariants", x => x.Id);
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ToolPricingVariants");
        }
    }
}
