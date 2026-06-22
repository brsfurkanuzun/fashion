using Fashion.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Fashion.Api.Auth;

/// <summary>PostgreSQL OAuth sütunları ve indeksleri (idempotent).</summary>
public static class ExternalAuthSchema
{
    public static async Task EnsureExternalAuthColumnsAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (db.Database.IsInMemory())
        {
            return;
        }

        var provider = db.Database.ProviderName ?? string.Empty;
        if (!provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        await db.Database.ExecuteSqlRawAsync(
            """
            ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "GoogleSub" character varying(128);
            ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AppleSub" character varying(128);
            ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "ProfilePhotoUrl" character varying(500);
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_GoogleSub" ON "Users" ("GoogleSub") WHERE "GoogleSub" IS NOT NULL;
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_AppleSub" ON "Users" ("AppleSub") WHERE "AppleSub" IS NOT NULL;
            """,
            cancellationToken);
    }
}
