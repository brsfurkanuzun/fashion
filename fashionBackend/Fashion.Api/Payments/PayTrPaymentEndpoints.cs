using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Fashion.Api.Data;
using Fashion.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Fashion.Api.Payments;

public static class PayTrPaymentEndpoints
{
    private const string GetTokenUrl = "https://www.paytr.com/odeme/api/get-token";

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

    public static void MapPayTrPayments(this WebApplication app)
    {
        app.MapPost("/api/payments/paytr/token", CreateTokenAsync);
        app.MapPost("/api/payments/paytr/notify", HandleNotificationAsync);
    }

    private static bool IsPayTrConfigured(PayTrOptions o) =>
        !string.IsNullOrWhiteSpace(o.MerchantId)
        && !string.IsNullOrWhiteSpace(o.MerchantKey)
        && !string.IsNullOrWhiteSpace(o.MerchantSalt);

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

    private static string BuildPayTrTokenStep1(
        string merchantId,
        string merchantKey,
        string merchantSalt,
        string userIp,
        string merchantOid,
        string email,
        int paymentAmountMinor,
        string userBasketBase64,
        int noInstallment,
        int maxInstallment,
        string currency,
        int testMode)
    {
        var paymentAmountStr = paymentAmountMinor.ToString(CultureInfo.InvariantCulture);
        var noInst = noInstallment.ToString(CultureInfo.InvariantCulture);
        var maxInst = maxInstallment.ToString(CultureInfo.InvariantCulture);
        var test = testMode.ToString(CultureInfo.InvariantCulture);
        var birlestir = string.Concat(
            merchantId,
            userIp,
            merchantOid,
            email,
            paymentAmountStr,
            userBasketBase64,
            noInst,
            maxInst,
            currency,
            test,
            merchantSalt);

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(merchantKey));
        return Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(birlestir)));
    }

    private static bool VerifyNotificationHash(
        string merchantKey,
        string merchantSalt,
        string merchantOid,
        string status,
        string totalAmount,
        string receivedHashBase64)
    {
        var data = string.Concat(merchantOid, merchantSalt, status, totalAmount);
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(merchantKey));
        var calc = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(data)));
        return string.Equals(calc, receivedHashBase64, StringComparison.Ordinal);
    }

    private static async Task<IResult> CreateTokenAsync(
        PayTrTokenRequest body,
        HttpContext http,
        AppDbContext db,
        IOptions<PayTrOptions> options,
        IHttpClientFactory httpFactory,
        ILoggerFactory logFactory,
        CancellationToken cancellationToken)
    {
        var log = logFactory.CreateLogger("PayTr");
        var opts = options.Value;
        if (!IsPayTrConfigured(opts))
        {
            return Results.Json(
                new { message = "PayTR yapılandırması eksik. PayTr:MerchantId, MerchantKey, MerchantSalt ayarlayın." },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        if (!PayTrPackageCatalog.TryResolve(body.PackageKey, out var amountMinor, out var credits, out var basketTitle))
        {
            return Results.BadRequest(new { message = "Geçersiz paket anahtarı." });
        }

        var phone = body.Phone?.Trim() ?? string.Empty;
        var address = body.Address?.Trim() ?? string.Empty;
        if (phone.Length < 10 || address.Length < 5)
        {
            return Results.BadRequest(new { message = "Telefon ve adres zorunlu (PayTR)." });
        }

        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == body.UserId, cancellationToken);
        if (user is null)
        {
            return Results.NotFound(new { message = "Kullanıcı bulunamadı." });
        }

        var merchantOid = "ND" + Guid.NewGuid().ToString("N");
        if (merchantOid.Length > 64)
        {
            return Results.Problem("merchant_oid çok uzun.");
        }

        var unitPrice = (amountMinor / 100.0).ToString("F2", CultureInfo.InvariantCulture);
        var basketJson = JsonSerializer.Serialize(new[] { new object[] { basketTitle, unitPrice, 1 } });
        var userBasketB64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(basketJson));

        var userIp = GetClientIp(http);
        var email = user.Email.Trim();
        var testMode = opts.TestMode;
        var noInst = opts.NoInstallment;
        var maxInst = opts.MaxInstallment;
        var currency = string.IsNullOrWhiteSpace(opts.Currency) ? "TL" : opts.Currency.Trim();

        var paytrToken = BuildPayTrTokenStep1(
            opts.MerchantId.Trim(),
            opts.MerchantKey.Trim(),
            opts.MerchantSalt.Trim(),
            userIp,
            merchantOid,
            email,
            amountMinor,
            userBasketB64,
            noInst,
            maxInst,
            currency,
            testMode);

        var fe = opts.FrontendBaseUrl.Trim().TrimEnd('/');
        var merchantOkUrl = $"{fe}/odeme/basarili";
        var merchantFailUrl = $"{fe}/odeme/hata";

        db.PaymentOrders.Add(new PaymentOrder
        {
            MerchantOid = merchantOid,
            UserId = user.Id,
            PackageKey = body.PackageKey.Trim(),
            PaymentAmountMinor = amountMinor,
            CreditsToGrant = credits,
            Status = "pending",
            CreatedAtUtc = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);

        var form = new Dictionary<string, string>
        {
            ["merchant_id"] = opts.MerchantId.Trim(),
            ["user_ip"] = userIp,
            ["merchant_oid"] = merchantOid,
            ["email"] = email,
            ["payment_amount"] = amountMinor.ToString(CultureInfo.InvariantCulture),
            ["paytr_token"] = paytrToken,
            ["user_basket"] = userBasketB64,
            ["debug_on"] = opts.DebugOn.ToString(CultureInfo.InvariantCulture),
            ["no_installment"] = noInst.ToString(CultureInfo.InvariantCulture),
            ["max_installment"] = maxInst.ToString(CultureInfo.InvariantCulture),
            ["user_name"] = user.DisplayName.Trim(),
            ["user_address"] = address,
            ["user_phone"] = phone,
            ["merchant_ok_url"] = merchantOkUrl,
            ["merchant_fail_url"] = merchantFailUrl,
            ["timeout_limit"] = opts.TimeoutLimitMinutes.ToString(CultureInfo.InvariantCulture),
            ["currency"] = currency,
            ["test_mode"] = testMode.ToString(CultureInfo.InvariantCulture),
        };

        if (!string.IsNullOrWhiteSpace(opts.Lang))
        {
            form["lang"] = opts.Lang.Trim();
        }

        using var content = new FormUrlEncodedContent(form);
        content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

        var client = httpFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(25);
        HttpResponseMessage resp;
        try
        {
            resp = await client.PostAsync(GetTokenUrl, content, cancellationToken);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "PayTR get-token bağlantı hatası.");
            return Results.Problem("PayTR bağlantı hatası.");
        }

        var text = await resp.Content.ReadAsStringAsync(cancellationToken);
        JsonDocument? doc = null;
        try
        {
            doc = JsonDocument.Parse(text);
        }
        catch
        {
            log.LogError("PayTR get-token geçersiz JSON: {Text}", text);
            return Results.Problem("PayTR beklenmeyen yanıt.");
        }

        using (doc)
        {
            var root = doc!.RootElement;
            var status = root.GetProperty("status").GetString();
            if (status != "success" || !root.TryGetProperty("token", out var tokenEl))
            {
                var reason = root.TryGetProperty("reason", out var r) ? r.GetString() : text;
                log.LogWarning("PayTR get-token failed: {Reason}", reason);
                return Results.BadRequest(new { message = reason ?? "PayTR token alınamadı." });
            }

            var token = tokenEl.GetString() ?? string.Empty;
            return Results.Ok(new { token, merchantOid });
        }
    }

    private static async Task<IResult> HandleNotificationAsync(
        HttpContext http,
        AppDbContext db,
        IOptions<PayTrOptions> options,
        ILoggerFactory logFactory,
        CancellationToken cancellationToken)
    {
        var log = logFactory.CreateLogger("PayTr");
        var opts = options.Value;
        if (!IsPayTrConfigured(opts))
        {
            return Results.Content("MISSING_CONFIG", "text/plain", Encoding.UTF8, StatusCodes.Status503ServiceUnavailable);
        }

        if (!http.Request.HasFormContentType)
        {
            return Results.BadRequest();
        }

        var form = await http.Request.ReadFormAsync(cancellationToken);
        var merchantOid = form["merchant_oid"].ToString();
        var status = form["status"].ToString();
        var totalAmount = form["total_amount"].ToString();
        var receivedHash = form["hash"].ToString();

        if (string.IsNullOrEmpty(merchantOid) || string.IsNullOrEmpty(status) || string.IsNullOrEmpty(totalAmount)
            || string.IsNullOrEmpty(receivedHash))
        {
            log.LogWarning("PayTR notify eksik alan.");
            return Results.Text("BAD", "text/plain", Encoding.UTF8, statusCode: 400);
        }

        if (!VerifyNotificationHash(
                opts.MerchantKey.Trim(),
                opts.MerchantSalt.Trim(),
                merchantOid,
                status,
                totalAmount,
                receivedHash))
        {
            log.LogWarning("PayTR notify hash uyuşmazlığı: {Oid}", merchantOid);
            return Results.Text("HASH", "text/plain", Encoding.UTF8, statusCode: 400);
        }

        await using var tx = await db.Database.BeginTransactionAsync(cancellationToken);
        var order = await db.PaymentOrders.FirstOrDefaultAsync(o => o.MerchantOid == merchantOid, cancellationToken);
        if (order is null)
        {
            log.LogWarning("PayTR notify bilinmeyen sipariş: {Oid}", merchantOid);
            await tx.RollbackAsync(cancellationToken);
            return Results.Text("OK", "text/plain", Encoding.UTF8);
        }

        if (order.Status == "paid")
        {
            await tx.CommitAsync(cancellationToken);
            return Results.Text("OK", "text/plain", Encoding.UTF8);
        }

        if (status == "success")
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
                Description = $"PayTR paket: {order.PackageKey}",
            });
            order.Status = "paid";
            order.CompletedAtUtc = DateTime.UtcNow;
        }
        else
        {
            order.Status = "failed";
            order.CompletedAtUtc = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);
        return Results.Text("OK", "text/plain", Encoding.UTF8);
    }

    public sealed record PayTrTokenRequest(Guid UserId, string PackageKey, string Phone, string Address);
}
