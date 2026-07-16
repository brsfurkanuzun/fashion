using System.Globalization;
using System.Net;
using System.Text;
using Fashion.Api.Data;
using Fashion.Api.Models;
using Iyzipay;
using Iyzipay.Model;
using Iyzipay.Request;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Fashion.Api.Payments;

public static class IyzicoPaymentEndpoints
{
    public static async Task EnsurePaymentOrdersTableAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (db.Database.IsInMemory())
        {
            await db.Database.EnsureCreatedAsync(cancellationToken);
            return;
        }

        var provider = db.Database.ProviderName ?? string.Empty;
        if (!provider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        await db.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS "PaymentOrders" (
              "MerchantOid" character varying(64) NOT NULL,
              "UserId" uuid NOT NULL,
              "PackageKey" character varying(40) NOT NULL,
              "PaymentAmountMinor" integer NOT NULL,
              "CreditsToGrant" integer NOT NULL,
              "Status" character varying(20) NOT NULL,
              "CreatedAtUtc" timestamp with time zone NOT NULL,
              "CompletedAtUtc" timestamp with time zone NULL,
              CONSTRAINT "PK_PaymentOrders" PRIMARY KEY ("MerchantOid"),
              CONSTRAINT "FK_PaymentOrders_Users_UserId"
                FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS "IX_PaymentOrders_UserId" ON "PaymentOrders" ("UserId");
            """,
            cancellationToken);
    }

    public static void MapIyzicoPayments(this WebApplication app)
    {
        app.MapPost("/api/payments/iyzico/initialize", InitializeAsync);
        app.MapPost("/api/payments/iyzico/callback", HandleCallbackAsync);
    }

    private static bool IsConfigured(IyzicoOptions o) =>
        !string.IsNullOrWhiteSpace(o.ApiKey) && !string.IsNullOrWhiteSpace(o.SecretKey);

    private static Iyzipay.Options BuildIyzipayOptions(IyzicoOptions o) => new()
    {
        ApiKey = o.ApiKey.Trim(),
        SecretKey = o.SecretKey.Trim(),
        BaseUrl = string.IsNullOrWhiteSpace(o.BaseUrl) ? "https://sandbox-api.iyzipay.com" : o.BaseUrl.Trim(),
    };

    private static string ResolveCallbackBaseUrl(IyzicoOptions opts, HttpContext http)
    {
        if (!string.IsNullOrWhiteSpace(opts.CallbackBaseUrl))
        {
            return opts.CallbackBaseUrl.Trim().TrimEnd('/');
        }

        var request = http.Request;
        return $"{request.Scheme}://{request.Host}";
    }

    private static string GetClientIp(HttpContext ctx)
    {
        var fwd = ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(fwd))
        {
            var first = fwd.Split(',')[0].Trim();
            if (first.Length > 0 && first.Length <= 39)
            {
                return first;
            }
        }

        var remote = ctx.Connection.RemoteIpAddress;
        if (remote is null)
        {
            return "127.0.0.1";
        }

        if (remote.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
        {
            if (remote.IsIPv4MappedToIPv6)
            {
                remote = remote.MapToIPv4();
            }
            else if (IPAddress.IPv6Loopback.Equals(remote))
            {
                return "127.0.0.1";
            }
        }

        return remote.ToString();
    }

    private static string FormatPhone(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("90", StringComparison.Ordinal) && digits.Length >= 12)
        {
            return "+" + digits;
        }

        if (digits.StartsWith('0') && digits.Length >= 11)
        {
            return "+9" + digits;
        }

        if (digits.Length == 10)
        {
            return "+90" + digits;
        }

        return "+" + digits;
    }

    private static (string Name, string Surname) SplitName(string displayName)
    {
        var parts = displayName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0)
        {
            return ("Musteri", "Ad");
        }

        if (parts.Length == 1)
        {
            return (parts[0], ".");
        }

        return (parts[0], parts[1]);
    }

    private static string FormatPrice(int amountMinor) =>
        (amountMinor / 100m).ToString("F2", CultureInfo.InvariantCulture);

    private static async Task<IResult> InitializeAsync(
        IyzicoInitializeRequest body,
        HttpContext http,
        AppDbContext db,
        IOptions<IyzicoOptions> options,
        ILoggerFactory logFactory,
        CancellationToken cancellationToken)
    {
        var log = logFactory.CreateLogger("Iyzico");
        var opts = options.Value;
        if (!IsConfigured(opts))
        {
            return Results.Json(
                new { message = "iyzico yapılandırması eksik. Iyzico:ApiKey ve SecretKey ayarlayın." },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        if (!PackageCatalog.TryResolve(body.PackageKey, out var amountMinor, out var credits, out var basketTitle))
        {
            return Results.BadRequest(new { message = "Geçersiz paket anahtarı." });
        }

        var phone = body.Phone?.Trim() ?? string.Empty;
        var address = body.Address?.Trim() ?? string.Empty;
        if (phone.Length < 10 || address.Length < 5)
        {
            return Results.BadRequest(new { message = "Telefon (en az 10 karakter) ve adres (en az 5 karakter) gerekli." });
        }

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == body.UserId, cancellationToken);
        if (user is null)
        {
            return Results.NotFound(new { message = "Kullanıcı bulunamadı." });
        }

        var conversationId = "ND" + Guid.NewGuid().ToString("N");
        if (conversationId.Length > 64)
        {
            return Results.Problem("Sipariş kimliği çok uzun.");
        }

        var price = FormatPrice(amountMinor);
        var callbackBase = ResolveCallbackBaseUrl(opts, http);
        var callbackUrl = $"{callbackBase}/api/payments/iyzico/callback";
        var (firstName, lastName) = SplitName(user.DisplayName);
        var identityNumber = string.IsNullOrWhiteSpace(body.IdentityNumber)
            ? "11111111111"
            : body.IdentityNumber.Trim();

        db.PaymentOrders.Add(new PaymentOrder
        {
            MerchantOid = conversationId,
            UserId = user.Id,
            PackageKey = body.PackageKey.Trim(),
            PaymentAmountMinor = amountMinor,
            CreditsToGrant = credits,
            Status = "pending",
            CreatedAtUtc = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);

        var now = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
        var request = new CreateCheckoutFormInitializeRequest
        {
            Locale = Locale.TR.ToString(),
            ConversationId = conversationId,
            Price = price,
            PaidPrice = price,
            Currency = Currency.TRY.ToString(),
            BasketId = conversationId,
            PaymentGroup = PaymentGroup.PRODUCT.ToString(),
            CallbackUrl = callbackUrl,
            EnabledInstallments = opts.EnabledInstallments?.Length > 0
                ? opts.EnabledInstallments.ToList()
                : new List<int> { 1 },
            Buyer = new Buyer
            {
                Id = user.Id.ToString(),
                Name = firstName,
                Surname = lastName,
                GsmNumber = FormatPhone(phone),
                Email = user.Email.Trim(),
                IdentityNumber = identityNumber,
                RegistrationAddress = address,
                LastLoginDate = now,
                RegistrationDate = now,
                Ip = GetClientIp(http),
                City = "Istanbul",
                Country = "Turkey",
                ZipCode = "34000",
            },
            ShippingAddress = new Address
            {
                ContactName = $"{firstName} {lastName}".Trim(),
                City = "Istanbul",
                Country = "Turkey",
                Description = address,
                ZipCode = "34000",
            },
            BillingAddress = new Address
            {
                ContactName = $"{firstName} {lastName}".Trim(),
                City = "Istanbul",
                Country = "Turkey",
                Description = address,
                ZipCode = "34000",
            },
            BasketItems = new List<BasketItem>
            {
                new BasketItem
                {
                    Id = body.PackageKey.Trim(),
                    Name = basketTitle,
                    Category1 = "Dijital Hizmet",
                    Category2 = "AI Görsel Üretim",
                    ItemType = BasketItemType.VIRTUAL.ToString(),
                    Price = price,
                },
            },
        };

        CheckoutFormInitialize checkoutFormInitialize;
        try
        {
            checkoutFormInitialize = await CheckoutFormInitialize.Create(request, BuildIyzipayOptions(opts));
        }
        catch (Exception ex)
        {
            log.LogError(ex, "iyzico checkout initialize bağlantı hatası.");
            return Results.Problem("iyzico bağlantı hatası.");
        }

        if (!string.Equals(checkoutFormInitialize.Status, Status.SUCCESS.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            log.LogWarning("iyzico initialize failed: {Reason}", checkoutFormInitialize.ErrorMessage);
            return Results.BadRequest(new { message = checkoutFormInitialize.ErrorMessage ?? "iyzico oturumu başlatılamadı." });
        }

        return Results.Ok(new
        {
            token = checkoutFormInitialize.Token,
            checkoutFormContent = checkoutFormInitialize.CheckoutFormContent,
            paymentPageUrl = checkoutFormInitialize.PaymentPageUrl,
            conversationId,
        });
    }

    private static async Task<IResult> HandleCallbackAsync(
        HttpContext http,
        AppDbContext db,
        IOptions<IyzicoOptions> options,
        ILoggerFactory logFactory,
        CancellationToken cancellationToken)
    {
        var log = logFactory.CreateLogger("Iyzico");
        var opts = options.Value;
        if (!IsConfigured(opts))
        {
            return Results.Content("MISSING_CONFIG", "text/plain", Encoding.UTF8, StatusCodes.Status503ServiceUnavailable);
        }

        if (!http.Request.HasFormContentType)
        {
            return RedirectFail(opts);
        }

        var form = await http.Request.ReadFormAsync(cancellationToken);
        var token = form["token"].ToString();
        if (string.IsNullOrEmpty(token))
        {
            log.LogWarning("iyzico callback eksik token.");
            return RedirectFail(opts);
        }

        CheckoutForm checkoutForm;
        try
        {
            checkoutForm = await CheckoutForm.Retrieve(new RetrieveCheckoutFormRequest
            {
                Locale = Locale.TR.ToString(),
                Token = token,
            }, BuildIyzipayOptions(opts));
        }
        catch (Exception ex)
        {
            log.LogError(ex, "iyzico retrieve hatası.");
            return RedirectFail(opts);
        }

        var conversationId = checkoutForm.ConversationId ?? string.Empty;
        if (string.IsNullOrEmpty(conversationId))
        {
            log.LogWarning("iyzico callback conversationId yok.");
            return RedirectFail(opts);
        }

        await using var tx = await db.Database.BeginTransactionAsync(cancellationToken);
        var order = await db.PaymentOrders.FirstOrDefaultAsync(o => o.MerchantOid == conversationId, cancellationToken);
        if (order is null)
        {
            log.LogWarning("iyzico callback bilinmeyen sipariş: {Id}", conversationId);
            await tx.RollbackAsync(cancellationToken);
            return RedirectFail(opts);
        }

        if (order.Status == "paid")
        {
            await tx.CommitAsync(cancellationToken);
            return RedirectSuccess(opts);
        }

        if (string.Equals(checkoutForm.PaymentStatus, "SUCCESS", StringComparison.OrdinalIgnoreCase))
        {
            var wallet = await db.CreditWallets.FirstOrDefaultAsync(w => w.UserId == order.UserId, cancellationToken);
            if (wallet is null)
            {
                wallet = new CreditWallet { UserId = order.UserId, Balance = order.CreditsToGrant };
                db.CreditWallets.Add(wallet);
            }
            else
            {
                wallet.Balance += order.CreditsToGrant;
            }

            db.CreditTransactions.Add(new CreditTransaction
            {
                UserId = order.UserId,
                Amount = order.CreditsToGrant,
                Type = CreditTransactionType.Topup,
                Description = $"iyzico paket: {order.PackageKey}",
            });
            order.Status = "paid";
            order.CompletedAtUtc = DateTime.UtcNow;
        }
        else
        {
            order.Status = "failed";
            order.CompletedAtUtc = DateTime.UtcNow;
            log.LogWarning("iyzico ödeme başarısız: {Status} {Error}", checkoutForm.PaymentStatus, checkoutForm.ErrorMessage);
        }

        await db.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return string.Equals(checkoutForm.PaymentStatus, "SUCCESS", StringComparison.OrdinalIgnoreCase)
            ? RedirectSuccess(opts)
            : RedirectFail(opts);
    }

    private static IResult RedirectSuccess(IyzicoOptions opts) =>
        Results.Redirect($"{opts.FrontendBaseUrl.Trim().TrimEnd('/')}/odeme/basarili");

    private static IResult RedirectFail(IyzicoOptions opts) =>
        Results.Redirect($"{opts.FrontendBaseUrl.Trim().TrimEnd('/')}/odeme/hata");

    public sealed record IyzicoInitializeRequest(
        Guid UserId,
        string PackageKey,
        string Phone,
        string Address,
        string? IdentityNumber);
}
