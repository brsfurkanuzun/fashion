using Fashion.Api.Data;
using Fashion.Api.Models;
using Fashion.Api.Security;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.SetIsOriginAllowed(origin =>
        {
            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
            {
                return false;
            }

            return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                || uri.Host.Equals("127.0.0.1");
        })
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("FrontendDev");

// Simple auto-migration for local development.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.InitializeAsync(db);
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", service = "fashion-backend" }));

app.MapGet("/api/users", async (AppDbContext db) =>
{
    var users = await db.Users
        .Include(u => u.CreditWallet)
        .Select(u => new
        {
            u.Id,
            u.Email,
            u.DisplayName,
            u.Role,
            Credits = u.CreditWallet != null ? u.CreditWallet.Balance : 0,
            u.CreatedAtUtc
        })
        .ToListAsync();

    return Results.Ok(users);
});

app.MapGet("/api/users/by-email/{email}", async (string email, AppDbContext db) =>
{
    var normalized = email.Trim().ToLowerInvariant();
    var user = await db.Users
        .Where(u => u.Email.ToLower() == normalized)
        .Select(u => new
        {
            u.Id,
            u.Email,
            u.DisplayName,
            u.Role,
            Credits = u.CreditWallet != null ? u.CreditWallet.Balance : 0
        })
        .FirstOrDefaultAsync();

    return user is null ? Results.NotFound(new { message = "User not found." }) : Results.Ok(user);
});

app.MapPost("/api/auth/register", async (RegisterRequest request, AppDbContext db) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    var name = request.Name.Trim();
    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.BadRequest(new { message = "Name, email ve sifre zorunlu." });
    }

    var existing = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
    if (existing is not null)
    {
        return Results.Conflict(new { message = "Bu e-posta zaten kayıtlı." });
    }

    var user = new User
    {
        Email = email,
        PasswordHash = PasswordHasher.Hash(request.Password),
        DisplayName = name,
        Role = "user"
    };

    db.Users.Add(user);
    db.CreditWallets.Add(new CreditWallet
    {
        User = user,
        Balance = 50
    });
    db.CreditTransactions.Add(new CreditTransaction
    {
        User = user,
        Amount = 50,
        Type = CreditTransactionType.Topup,
        Description = "Welcome credits"
    });

    await db.SaveChangesAsync();

    return Results.Created($"/api/users/{user.Id}", new
    {
        user.Id,
        user.Email,
        user.DisplayName,
        user.Role,
        Credits = 50
    });
});

app.MapPost("/api/auth/login", async (LoginRequest request, AppDbContext db) =>
{
    var raw = request.EmailOrUsername.Trim().ToLowerInvariant();
    var lookupEmail = raw == "admin" ? "admin@fashion.local" : raw;
    var user = await db.Users
        .Include(u => u.CreditWallet)
        .FirstOrDefaultAsync(u => u.Email.ToLower() == lookupEmail);
    if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
    {
        return Results.BadRequest(new { message = "Gecersiz kullanici veya sifre." });
    }

    return Results.Ok(new
    {
        user.Id,
        user.Email,
        user.DisplayName,
        user.Role,
        Credits = user.CreditWallet?.Balance ?? 0
    });
});

app.MapGet("/api/jobs", async (Guid? userId, AppDbContext db) =>
{
    var query = db.GenerationJobs.AsQueryable();
    if (userId.HasValue)
    {
        query = query.Where(x => x.UserId == userId.Value);
    }

    var jobs = await query
        .OrderByDescending(x => x.CreatedAtUtc)
        .Select(x => new
        {
            x.Id,
            x.ToolKey,
            x.Status,
            x.CreditCost,
            x.Prompt,
            x.CreatedAtUtc
        })
        .ToListAsync();

    return Results.Ok(jobs);
});

app.MapGet("/api/tools", async (string? workspace, AppDbContext db) =>
{
    var query = db.ToolDefinitions.Where(t => t.IsActive);
    if (!string.IsNullOrWhiteSpace(workspace))
    {
        query = query.Where(t => t.Workspace == workspace);
    }

    var tools = await query
        .OrderBy(t => t.Workspace)
        .ThenBy(t => t.Label)
        .Select(t => new
        {
            t.ToolKey,
            t.Workspace,
            t.Label,
            t.CreditCost,
            t.IsNew
        })
        .ToListAsync();

    return Results.Ok(tools);
});

app.MapGet("/api/me/{userId:guid}", async (Guid userId, AppDbContext db) =>
{
    var user = await db.Users
        .Include(u => u.CreditWallet)
        .FirstOrDefaultAsync(u => u.Id == userId);

    return user is null
        ? Results.NotFound(new { message = "User not found." })
        : Results.Ok(new
        {
            user.Id,
            user.Email,
            user.DisplayName,
            user.Role,
            Credits = user.CreditWallet?.Balance ?? 0,
            user.CreatedAtUtc
        });
});

app.MapPatch("/api/me/{userId:guid}", async (Guid userId, UpdateMeRequest request, AppDbContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
    if (user is null)
    {
        return Results.NotFound(new { message = "User not found." });
    }

    var nextName = request.DisplayName.Trim();
    if (string.IsNullOrWhiteSpace(nextName))
    {
        return Results.BadRequest(new { message = "Display name zorunlu." });
    }

    user.DisplayName = nextName;
    await db.SaveChangesAsync();
    return Results.Ok(new { user.Id, user.DisplayName });
});

app.MapDelete("/api/me/{userId:guid}", async (Guid userId, AppDbContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
    if (user is null)
    {
        return Results.NotFound(new { message = "User not found." });
    }

    var wallets = db.CreditWallets.Where(x => x.UserId == userId);
    var transactions = db.CreditTransactions.Where(x => x.UserId == userId);
    var jobs = db.GenerationJobs.Where(x => x.UserId == userId);
    var gallery = db.GalleryItems.Where(x => x.UserId == userId);

    db.CreditWallets.RemoveRange(wallets);
    db.CreditTransactions.RemoveRange(transactions);
    db.GenerationJobs.RemoveRange(jobs);
    db.GalleryItems.RemoveRange(gallery);
    db.Users.Remove(user);

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Hesap silindi." });
});

app.MapPost("/api/jobs", async (CreateJobRequest request, AppDbContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(x => x.Id == request.UserId);
    if (user is null)
    {
        return Results.NotFound(new { message = "User not found." });
    }

    var wallet = await db.CreditWallets.FirstAsync(x => x.UserId == user.Id);
    if (wallet.Balance < request.CreditCost)
    {
        return Results.BadRequest(new { message = "Yetersiz kredi." });
    }

    wallet.Balance -= request.CreditCost;

    var job = new GenerationJob
    {
        UserId = user.Id,
        ToolKey = request.ToolKey,
        Prompt = request.Prompt,
        CreditCost = request.CreditCost,
        Status = JobStatus.Queued
    };

    db.GenerationJobs.Add(job);
    db.CreditTransactions.Add(new CreditTransaction
    {
        UserId = user.Id,
        Amount = -request.CreditCost,
        Type = CreditTransactionType.Spend,
        Description = $"Generation reserved for {request.ToolKey}"
    });

    await db.SaveChangesAsync();

    return Results.Created($"/api/jobs/{job.Id}", new { job.Id, job.Status, RemainingCredits = wallet.Balance });
});

app.MapGet("/api/gallery", async (Guid userId, AppDbContext db) =>
{
    var items = await db.GalleryItems
        .Where(g => g.UserId == userId)
        .OrderByDescending(g => g.CreatedAtUtc)
        .Select(g => new
        {
            g.Id,
            g.ToolKey,
            g.PreviewUrl,
            g.CreatedAtUtc
        })
        .ToListAsync();

    return Results.Ok(items);
});

app.MapGet("/api/billing/summary/{userId:guid}", async (Guid userId, AppDbContext db) =>
{
    var user = await db.Users.Include(u => u.CreditWallet).FirstOrDefaultAsync(u => u.Id == userId);
    if (user is null)
    {
        return Results.NotFound(new { message = "User not found." });
    }

    var spentThisMonth = await db.CreditTransactions
        .Where(t => t.UserId == userId && t.Amount < 0 && t.CreatedAtUtc >= DateTime.UtcNow.AddDays(-30))
        .SumAsync(t => (int?)Math.Abs(t.Amount)) ?? 0;

    return Results.Ok(new
    {
        Plan = user.Role == "admin" ? "pro" : "free",
        CurrentCredits = user.CreditWallet?.Balance ?? 0,
        SpentLast30Days = spentThisMonth
    });
});

app.MapGet("/api/credits/transactions/{userId:guid}", async (Guid userId, AppDbContext db) =>
{
    var entries = await db.CreditTransactions
        .Where(x => x.UserId == userId)
        .OrderByDescending(x => x.CreatedAtUtc)
        .Select(x => new
        {
            x.Id,
            x.Amount,
            Type = x.Type.ToString(),
            x.Description,
            x.CreatedAtUtc
        })
        .ToListAsync();

    return Results.Ok(entries);
});

app.MapGet("/api/changelog", async (AppDbContext db) =>
{
    var entries = await db.ChangelogEntries
        .OrderByDescending(x => x.PublishedAtUtc)
        .Select(x => new
        {
            x.Id,
            x.Title,
            x.Summary,
            x.Type,
            x.PublishedAtUtc
        })
        .ToListAsync();
    return Results.Ok(entries);
});

app.MapGet("/api/docs/support", () => Results.Ok(new[]
{
    new { title = "Başlangıç", body = "Giriş yaptıktan sonra bir tool seçip Oluştur ile job başlatın." },
    new { title = "Kredi sistemi", body = "Her üretimde tool kredi maliyeti kadar bakiye düşer." },
    new { title = "Galeri", body = "Tamamlanan görseller galeriye kayıt edilir." }
}));

app.Run();

public sealed record CreateJobRequest(Guid UserId, string ToolKey, string Prompt, int CreditCost);
public sealed record RegisterRequest(string Email, string Name, string Password);
public sealed record LoginRequest(string EmailOrUsername, string Password);
public sealed record UpdateMeRequest(string DisplayName);
