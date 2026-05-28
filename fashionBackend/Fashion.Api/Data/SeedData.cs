using Fashion.Api.Models;
using Fashion.Api.Security;
using Microsoft.EntityFrameworkCore;

namespace Fashion.Api.Data;

public static class SeedData
{
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

        if (!await db.ToolDefinitions.AnyAsync())
        {
            db.ToolDefinitions.AddRange(
                new ToolDefinition { ToolKey = "cekim-model", Workspace = "cekim", Label = "MODEL\\TRY ON", CreditCost = 40 },
                new ToolDefinition { ToolKey = "cekim-editorial", Workspace = "cekim", Label = "EDITORIAL", CreditCost = 55 },
                new ToolDefinition { ToolKey = "cekim-pose", Workspace = "cekim", Label = "POSE", CreditCost = 30 },
                new ToolDefinition { ToolKey = "cekim-video", Workspace = "cekim", Label = "VIDEO", CreditCost = 80 },
                new ToolDefinition { ToolKey = "pro-model", Workspace = "produksiyon", Label = "MODEL", CreditCost = 150 },
                new ToolDefinition { ToolKey = "pro-tryon", Workspace = "produksiyon", Label = "TRY ON", CreditCost = 120 },
                new ToolDefinition { ToolKey = "pro-edit", Workspace = "produksiyon", Label = "EDIT", CreditCost = 95 },
                new ToolDefinition { ToolKey = "pro-decoupe", Workspace = "produksiyon", Label = "DECOUPE", CreditCost = 45 },
                new ToolDefinition { ToolKey = "pro-editorial", Workspace = "produksiyon", Label = "EDITORIAL", CreditCost = 110 },
                new ToolDefinition { ToolKey = "pro-moodboard", Workspace = "produksiyon", Label = "MOODBOARD", CreditCost = 65 },
                new ToolDefinition { ToolKey = "pro-swap", Workspace = "produksiyon", Label = "SWAP", CreditCost = 90 },
                new ToolDefinition { ToolKey = "pro-pose", Workspace = "produksiyon", Label = "POSE", CreditCost = 70 },
                new ToolDefinition { ToolKey = "pro-angle", Workspace = "produksiyon", Label = "ANGLE", CreditCost = 60 },
                new ToolDefinition { ToolKey = "pro-video", Workspace = "produksiyon", Label = "VIDEO", CreditCost = 180 }
            );
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
