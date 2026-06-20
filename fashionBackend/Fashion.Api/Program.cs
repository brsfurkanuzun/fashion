using Fashion.Api.Data;
using Fashion.Api.Models;
using Fashion.Api.Payments;
using Fashion.Api.Auth;
using Fashion.Api.Security;
using Fashion.Api.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Render ve benzeri ortamlar: PORT ortam değişkeni
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

var useInMemoryDb = builder.Configuration.GetValue("Database:UseInMemory", false);

builder.Services.Configure<PayTrOptions>(builder.Configuration.GetSection("PayTr"));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection("Auth"));
builder.Services.AddHttpClient();
builder.Services.AddHttpClient<FashnService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Fashn:BaseUrl"] ?? "https://api.fashn.ai");
});
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (useInMemoryDb)
    {
        options.UseInMemoryDatabase("FashionDev");
    }
    else
    {
        var connectionString = ResolvePostgresConnectionString(builder.Configuration);
        options.UseNpgsql(connectionString, npgsql =>
            npgsql.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(15),
                errorCodesToAdd: null));
    }
});

var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()?.ToList() ?? [];
if (builder.Environment.IsDevelopment())
{
    corsOrigins.AddRange(["http://localhost:5173", "http://127.0.0.1:5173"]);
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(corsOrigins.Distinct(StringComparer.OrdinalIgnoreCase).ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("Frontend");

var skipMigrations = builder.Configuration.GetValue("Database:SkipMigrations", false);
var continueOnInitFailure = builder.Configuration.GetValue("Database:ContinueOnInitFailure", false);
var initLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseInit");

try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (useInMemoryDb)
        {
            await db.Database.EnsureCreatedAsync();
        }
        else if (!skipMigrations)
        {
            await db.Database.MigrateAsync();
        }

        await SeedData.InitializeAsync(db);
        await PayTrPaymentEndpoints.EnsurePaymentOrdersTableAsync(db);
        await ExternalAuthSchema.EnsureExternalAuthColumnsAsync(db);
    }
}
catch (Exception ex) when (continueOnInitFailure)
{
    initLogger.LogError(ex, "Database init failed; continuing (Database:ContinueOnInitFailure=true). Fix PostgreSQL / ConnectionStrings.");
}

static string ResolvePostgresConnectionString(IConfiguration configuration)
{
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (!string.IsNullOrWhiteSpace(databaseUrl))
    {
        return ParseDatabaseUrl(databaseUrl);
    }

    return configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection or DATABASE_URL is required.");
}

static string ParseDatabaseUrl(string databaseUrl)
{
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':', 2);
    var builder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = uri.AbsolutePath.TrimStart('/'),
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        SslMode = SslMode.Require,
        TrustServerCertificate = true,
    };
    return builder.ConnectionString;
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
        .ThenBy(t => t.Quality)
        .Select(t => new
        {
            t.Id,
            t.ToolKey,
            t.Workspace,
            t.Label,
            t.Quality,
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

app.MapPost("/api/jobs", async (CreateJobRequest request, AppDbContext db, FashnService fashn) =>
{
    var user = await db.Users.FirstOrDefaultAsync(x => x.Id == request.UserId);
    if (user is null)
    {
        return Results.NotFound(new { message = "User not found." });
    }

    var modelName = FashnModelMap.Resolve(request.ToolKey);
    if (modelName is null)
    {
        return Results.BadRequest(new { message = $"Bilinmeyen tool: {request.ToolKey}" });
    }

    var (creditCost, creditError) = await ToolCreditCalculator.ResolveAsync(db, request.ToolKey, request.Inputs);
    if (creditError is not null)
    {
        return Results.BadRequest(new { message = creditError });
    }

    var wallet = await db.CreditWallets.FirstAsync(x => x.UserId == user.Id);
    if (wallet.Balance < creditCost)
    {
        return Results.BadRequest(new { message = "Yetersiz kredi." });
    }

    wallet.Balance -= creditCost;

    var job = new GenerationJob
    {
        UserId = user.Id,
        ToolKey = request.ToolKey,
        Prompt = request.Prompt,
        CreditCost = creditCost,
        Status = JobStatus.Queued
    };

    db.GenerationJobs.Add(job);
    db.CreditTransactions.Add(new CreditTransaction
    {
        UserId = user.Id,
        Amount = -creditCost,
        Type = CreditTransactionType.Spend,
        Description = $"Generation reserved for {request.ToolKey}"
    });

    await db.SaveChangesAsync();

    // FASHN API çağrısı
    var fashnResult = await fashn.RunAsync(modelName, request.Inputs);

    if (!fashnResult.IsSuccess)
    {
        // Hata durumunda krediyi iade et
        job.Status = JobStatus.Failed;
        job.ErrorMessage = fashnResult.Error;
        wallet.Balance += creditCost;
        db.CreditTransactions.Add(new CreditTransaction
        {
            UserId = user.Id,
            Amount = creditCost,
            Type = CreditTransactionType.Refund,
            Description = $"Refund — FASHN error: {fashnResult.Error?[..Math.Min(200, fashnResult.Error.Length)]}"
        });
        await db.SaveChangesAsync();
        return Results.UnprocessableEntity(new { message = "AI servisine ulaşılamadı.", detail = fashnResult.Error });
    }

    job.FashnJobId = fashnResult.Id;
    job.Status = JobStatus.Running;
    await db.SaveChangesAsync();

    return Results.Created($"/api/jobs/{job.Id}", new
    {
        job.Id,
        job.FashnJobId,
        Status = job.Status.ToString(),
        RemainingCredits = wallet.Balance
    });
});

app.MapGet("/api/jobs/{id:guid}/status", async (Guid id, AppDbContext db, FashnService fashn) =>
{
    var job = await db.GenerationJobs.FirstOrDefaultAsync(x => x.Id == id);
    if (job is null)
    {
        return Results.NotFound(new { message = "Job bulunamadı." });
    }

    // Zaten tamamlanmışsa doğrudan dön
    if (job.Status is JobStatus.Completed or JobStatus.Failed)
    {
        return Results.Ok(new
        {
            job.Id,
            Status = job.Status.ToString(),
            ResultUrls = job.ResultUrls is not null
                ? JsonSerializer.Deserialize<List<string>>(job.ResultUrls)
                : null,
            job.ErrorMessage,
            job.CompletedAtUtc
        });
    }

    if (job.FashnJobId is null)
    {
        return Results.Ok(new { job.Id, Status = job.Status.ToString(), ResultUrls = (object?)null, job.ErrorMessage });
    }

    var fashnStatus = await fashn.GetStatusAsync(job.FashnJobId);

    if (fashnStatus.IsCompleted)
    {
        job.Status = JobStatus.Completed;
        job.CompletedAtUtc = DateTime.UtcNow;
        job.ResultUrls = JsonSerializer.Serialize(fashnStatus.Outputs ?? []);

        // Galeriye ekle
        if (fashnStatus.Outputs?.Count > 0)
        {
            db.GalleryItems.Add(new GalleryItem
            {
                UserId = job.UserId,
                SourceJobId = job.Id,
                ToolKey = job.ToolKey,
                PreviewUrl = fashnStatus.Outputs[0]
            });
        }

        await db.SaveChangesAsync();
    }
    else if (fashnStatus.IsFailed)
    {
        job.Status = JobStatus.Failed;
        job.CompletedAtUtc = DateTime.UtcNow;
        job.ErrorMessage = fashnStatus.ErrorMessage;

        // Kredi iadesi
        var wallet = await db.CreditWallets.FirstOrDefaultAsync(x => x.UserId == job.UserId);
        if (wallet is not null)
        {
            wallet.Balance += job.CreditCost;
            db.CreditTransactions.Add(new CreditTransaction
            {
                UserId = job.UserId,
                Amount = job.CreditCost,
                Type = CreditTransactionType.Refund,
                Description = $"Refund — job {job.Id} başarısız oldu"
            });
        }

        await db.SaveChangesAsync();
    }

    return Results.Ok(new
    {
        job.Id,
        Status = job.Status.ToString(),
        FashnStatus = fashnStatus.Status,
        ResultUrls = fashnStatus.Outputs,
        ErrorMessage = fashnStatus.ErrorMessage ?? job.ErrorMessage,
        job.CompletedAtUtc
    });
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

app.MapGet("/api/tools/{toolKey}/pricing", async (string toolKey, AppDbContext db) =>
{
    var qualities = await db.ToolDefinitions
        .Where(t => t.ToolKey == toolKey && t.IsActive)
        .OrderBy(t => t.Quality)
        .Select(t => new { t.Quality, t.CreditCost, t.Label })
        .ToListAsync();

    return qualities.Count == 0
        ? Results.NotFound()
        : Results.Ok(new { toolKey, qualities });
});

app.MapGet("/api/docs/support", () => Results.Ok(new[]
{
    new { title = "Başlangıç", body = "Giriş yaptıktan sonra bir tool seçip Oluştur ile job başlatın." },
    new { title = "Kredi sistemi", body = "Her üretimde tool kredi maliyeti kadar bakiye düşer." },
    new { title = "Galeri", body = "Tamamlanan görseller galeriye kayıt edilir." }
}));

app.MapPayTrPayments();
app.MapExternalAuth();

app.Run();

public sealed record CreateJobRequest(Guid UserId, string ToolKey, string Prompt, int CreditCost, JsonElement Inputs);
public sealed record RegisterRequest(string Email, string Name, string Password);
public sealed record LoginRequest(string EmailOrUsername, string Password);
public sealed record UpdateMeRequest(string DisplayName);
