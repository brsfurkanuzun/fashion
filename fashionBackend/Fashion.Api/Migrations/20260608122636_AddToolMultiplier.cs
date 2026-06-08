using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fashion.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddToolMultiplier : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Multiplier",
                table: "ToolDefinitions",
                type: "numeric(6,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Multiplier",
                table: "ToolDefinitions");
        }
    }
}
