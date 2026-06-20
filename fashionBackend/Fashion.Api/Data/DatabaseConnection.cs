using System.Text.RegularExpressions;

namespace Fashion.Api.Data;

public static class DatabaseConnection
{
    /// <summary>
    /// Railway <c>DATABASE_URL</c> (postgresql://…) veya appsettings connection string.
    /// </summary>
    public static string Resolve(IConfiguration configuration)
    {
        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            return ParseDatabaseUrl(databaseUrl);
        }

        return configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection or DATABASE_URL is required.");
    }

    private static string ParseDatabaseUrl(string databaseUrl)
    {
        var match = Regex.Match(
            databaseUrl,
            @"^postgres(?:ql)?://([^:]+):([^@]+)@([^:/]+)(?::(\d+))?/([^?]+)",
            RegexOptions.IgnoreCase);

        if (!match.Success)
        {
            throw new InvalidOperationException("DATABASE_URL format is invalid.");
        }

        var user = Uri.UnescapeDataString(match.Groups[1].Value);
        var password = Uri.UnescapeDataString(match.Groups[2].Value);
        var host = match.Groups[3].Value;
        var port = match.Groups[4].Success ? match.Groups[4].Value : "5432";
        var database = match.Groups[5].Value;

        return $"Host={host};Port={port};Database={database};Username={user};Password={password};SSL Mode=Require;Trust Server Certificate=true";
    }
}
