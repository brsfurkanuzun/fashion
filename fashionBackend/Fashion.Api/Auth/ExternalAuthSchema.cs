using Fashion.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Fashion.Api.Auth;

/// <summary>MySQL'de OAuth sütunları ve indeksleri (migration derlenmediği için idempotent).</summary>
public static class ExternalAuthSchema
{
    public static async Task EnsureExternalAuthColumnsAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (db.Database.IsInMemory())
        {
            return;
        }

        var provider = db.Database.ProviderName ?? string.Empty;
        if (!provider.Contains("MySql", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        await TryExecAsync(db, "ALTER TABLE `Users` ADD COLUMN `GoogleSub` varchar(128) NULL;", cancellationToken);
        await TryExecAsync(db, "ALTER TABLE `Users` ADD COLUMN `AppleSub` varchar(128) NULL;", cancellationToken);
        await TryExecAsync(
            db,
            "CREATE UNIQUE INDEX `IX_Users_GoogleSub` ON `Users` (`GoogleSub`);",
            cancellationToken);
        await TryExecAsync(
            db,
            "CREATE UNIQUE INDEX `IX_Users_AppleSub` ON `Users` (`AppleSub`);",
            cancellationToken);
    }

    private static async Task TryExecAsync(AppDbContext db, string sql, CancellationToken cancellationToken)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(sql, cancellationToken);
        }
        catch (Exception ex) when (IsBenignSchemaError(ex))
        {
            // Sütun / indeks zaten var
        }
    }

    private static bool IsBenignSchemaError(Exception ex)
    {
        for (var e = ex; e != null; e = e.InnerException!)
        {
            var msg = e.Message;
            if (msg.Contains("Duplicate column", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("check that column/key exists", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("Duplicate key name", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("already exists", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }
}
