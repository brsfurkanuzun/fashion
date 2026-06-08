using Fashion.Api.Models;
using Fashion.Api.Security;
using Microsoft.EntityFrameworkCore;

namespace Fashion.Api.Data;

public static class SeedData
{
    private static IEnumerable<ToolDefinition> ToolRows(string key, string ws, string label, int cost1k, int cost2k, int cost4k, bool isNew = false)
    {
        yield return new ToolDefinition { ToolKey = key, Workspace = ws, Label = label, Quality = "1k", CreditCost = cost1k, IsNew = isNew };
        yield return new ToolDefinition { ToolKey = key, Workspace = ws, Label = label, Quality = "2k", CreditCost = cost2k, IsNew = isNew };
        yield return new ToolDefinition { ToolKey = key, Workspace = ws, Label = label, Quality = "4k", CreditCost = cost4k, IsNew = isNew };
    }

    private static IEnumerable<ToolDefinition> ToolRowsScaled(string key, string ws, string label, int base2k)
        => ToolRows(key, ws, label, (int)Math.Round(base2k * 0.6), base2k, (int)Math.Round(base2k * 1.5));

    private static readonly string[] ExpectedQualities = ["1k", "2k", "4k"];

    private static IEnumerable<ToolDefinition> AllToolRows()
        =>
        [
            ..ToolRowsScaled("cekim-model", "cekim", "MODEL\\TRY ON", 40),
            ..ToolRowsScaled("cekim-editorial", "cekim", "EDITORIAL", 55),
            ..ToolRowsScaled("cekim-pose", "cekim", "POSE", 30),
            ..ToolRowsScaled("cekim-video", "cekim", "VIDEO", 80),
            ..ToolRowsScaled("pro-model", "produksiyon", "MODEL", 150),
            ..ToolRows("pro-tryon", "produksiyon", "TRY ON", 6, 9, 12),
            ..ToolRowsScaled("pro-edit", "produksiyon", "EDIT", 95),
            ..ToolRows("pro-decoupe", "produksiyon", "DECOUPE", 6, 9, 12),
            ..ToolRowsScaled("pro-editorial", "produksiyon", "EDITORIAL", 110),
            ..ToolRowsScaled("pro-moodboard", "produksiyon", "MOODBOARD", 65),
            ..ToolRowsScaled("pro-swap", "produksiyon", "SWAP", 90),
            ..ToolRowsScaled("pro-pose", "produksiyon", "POSE", 70),
            ..ToolRowsScaled("pro-angle", "produksiyon", "ANGLE", 60),
            ..ToolRowsScaled("pro-video", "produksiyon", "VIDEO", 180),
        ];

    private static async Task<bool> NeedsToolReseedAsync(AppDbContext db)
    {
        var rows = await db.ToolDefinitions
            .GroupBy(t => t.ToolKey)
            .Select(g => new { ToolKey = g.Key, Qualities = g.Select(t => t.Quality).ToList() })
            .ToListAsync();

        if (rows.Count != 14)
            return true;

        return rows.Any(r =>
            ExpectedQualities.Any(q => !r.Qualities.Contains(q)));
    }

    public static async Task InitializeAsync(AppDbContext db)
    {
        var admin = await db.Users.FirstOrDefaultAsync(x => x.Email == "admin@fashion.local");
        if (admin is null)
        {
            admin = new User
            {
                Email = "admin@fashion.local",
                PasswordHash = PasswordHasher.Hash("admin"),
                DisplayName = "Admin",
                Role = "admin"
            };

            db.Users.Add(admin);
            db.CreditWallets.Add(new CreditWallet
            {
                User = admin,
                Balance = 500
            });

            db.CreditTransactions.Add(new CreditTransaction
            {
                User = admin,
                Amount = 500,
                Type = CreditTransactionType.Topup,
                Description = "Initial seed credits"
            });
        }
        else if (string.IsNullOrWhiteSpace(admin.PasswordHash))
        {
            admin.PasswordHash = PasswordHasher.Hash("admin");
        }

        if (await NeedsToolReseedAsync(db))
        {
            db.ToolDefinitions.RemoveRange(await db.ToolDefinitions.ToListAsync());
            db.ToolDefinitions.AddRange(AllToolRows());
        }

        if (!await db.ChangelogEntries.AnyAsync())
        {
            db.ChangelogEntries.AddRange(
                new ChangelogEntry { Title = "Studio job queue eklendi", Type = "feature", Summary = "Oluştur aksiyonu backend job kuyruğuna yazılıyor ve kredi düşümü yapılıyor." },
                new ChangelogEntry { Title = "Gerçek auth kontrolü", Type = "security", Summary = "Register/login akışı şifre hash doğrulaması ile backend'e taşındı." },
                new ChangelogEntry { Title = "Tool kataloğu seed edildi", Type = "improvement", Summary = "FAST ve PRO araçlarının kredi maliyetleri veritabanına eklendi." }
            );
        }

        await db.SaveChangesAsync();
    }
}
