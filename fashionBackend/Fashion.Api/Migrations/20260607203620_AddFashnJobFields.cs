using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fashion.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFashnJobFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAtUtc",
                table: "GenerationJobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorMessage",
                table: "GenerationJobs",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FashnJobId",
                table: "GenerationJobs",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResultUrls",
                table: "GenerationJobs",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_GenerationJobs_FashnJobId",
                table: "GenerationJobs",
                column: "FashnJobId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GenerationJobs_FashnJobId",
                table: "GenerationJobs");

            migrationBuilder.DropColumn(
                name: "CompletedAtUtc",
                table: "GenerationJobs");

            migrationBuilder.DropColumn(
                name: "ErrorMessage",
                table: "GenerationJobs");

            migrationBuilder.DropColumn(
                name: "FashnJobId",
                table: "GenerationJobs");

            migrationBuilder.DropColumn(
                name: "ResultUrls",
                table: "GenerationJobs");
        }
    }
}
