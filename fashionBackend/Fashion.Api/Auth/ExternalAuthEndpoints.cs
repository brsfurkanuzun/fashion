using System.Security.Cryptography;
using Fashion.Api.Data;
using Fashion.Api.Models;
using Fashion.Api.Security;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace Fashion.Api.Auth;

public static class ExternalAuthEndpoints
{
    private const string AppleIssuer = "https://appleid.apple.com";
    private const string AppleMetadata = "https://appleid.apple.com/.well-known/openid-configuration";

    public static void MapExternalAuth(this WebApplication app)
    {
        app.MapGet("/api/auth/client-config", (IOptions<AuthOptions> options) =>
        {
            var o = options.Value;
            var g = o.Google.ClientId.Trim();
            var a = o.Apple.ServicesId.Trim();
            return Results.Ok(new
            {
                googleClientId = string.IsNullOrEmpty(g) ? null : g,
                appleServicesId = string.IsNullOrEmpty(a) ? null : a,
            });
        });

        app.MapPost("/api/auth/google", GoogleAsync);
        app.MapPost("/api/auth/apple", AppleAsync);
    }

    private static async Task<IResult> GoogleAsync(
        GoogleCredentialRequest body,
        AppDbContext db,
        IOptions<AuthOptions> options,
        CancellationToken cancellationToken)
    {
        var clientId = options.Value.Google.ClientId.Trim();
        if (string.IsNullOrEmpty(clientId))
        {
            return Results.Json(new { message = "Google OAuth yapılandırılmadı (Auth:Google:ClientId)." }, statusCode: 503);
        }

        if (string.IsNullOrWhiteSpace(body.Credential))
        {
            return Results.BadRequest(new { message = "credential gerekli." });
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [clientId],
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(body.Credential.Trim(), settings);
        }
        catch
        {
            return Results.BadRequest(new { message = "Google token doğrulanamadı." });
        }

        var sub = payload.Subject;
        var email = payload.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(email))
        {
            return Results.BadRequest(new { message = "Google hesabında e-posta bulunamadı." });
        }

        if (payload.EmailVerified is false)
        {
            return Results.BadRequest(new { message = "Google e-postası doğrulanmamış." });
        }

        var name = string.IsNullOrWhiteSpace(payload.Name) ? email.Split('@')[0] : payload.Name.Trim();

        try
        {
            var user = await UpsertOAuthUserAsync(db, googleSub: sub, appleSub: null, email, name, cancellationToken);
            return await SessionOkAsync(user, db, cancellationToken);
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("CONFLICT", StringComparison.Ordinal))
        {
            return Results.Conflict(new { message = "Bu e-posta başka bir Google hesabına bağlı." });
        }
    }

    private static async Task<IResult> AppleAsync(
        AppleTokenRequest body,
        AppDbContext db,
        IOptions<AuthOptions> options,
        CancellationToken cancellationToken)
    {
        var servicesId = options.Value.Apple.ServicesId.Trim();
        if (string.IsNullOrEmpty(servicesId))
        {
            return Results.Json(new { message = "Apple Sign In yapılandırılmadı (Auth:Apple:ServicesId)." }, statusCode: 503);
        }

        if (string.IsNullOrWhiteSpace(body.IdentityToken))
        {
            return Results.BadRequest(new { message = "identityToken gerekli." });
        }

        string sub;
        string? emailFromToken;
        try
        {
            (sub, emailFromToken) = await ValidateAppleIdentityTokenAsync(body.IdentityToken.Trim(), servicesId, cancellationToken);
        }
        catch
        {
            return Results.BadRequest(new { message = "Apple token doğrulanamadı." });
        }

        var emailFromClient = body.Email?.Trim().ToLowerInvariant();
        var emailNorm = !string.IsNullOrEmpty(emailFromToken)
            ? emailFromToken!
            : !string.IsNullOrEmpty(emailFromClient)
                ? emailFromClient
                : BuildApplePlaceholderEmail(sub);

        var nameParts = new[] { body.FirstName?.Trim(), body.LastName?.Trim() }.Where(s => !string.IsNullOrEmpty(s));
        var name = string.Join(' ', nameParts);
        if (string.IsNullOrWhiteSpace(name))
        {
            name = emailNorm.Split('@')[0];
        }

        try
        {
            var user = await UpsertOAuthUserAsync(db, googleSub: null, appleSub: sub, emailNorm, name, cancellationToken);
            return await SessionOkAsync(user, db, cancellationToken);
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("CONFLICT", StringComparison.Ordinal))
        {
            return Results.Conflict(new { message = "Bu e-posta başka bir Apple hesabına bağlı." });
        }
    }

    private static async Task<(string sub, string? email)> ValidateAppleIdentityTokenAsync(
        string identityToken,
        string servicesId,
        CancellationToken cancellationToken)
    {
        var handler = new JwtSecurityTokenHandler();
        var retriever = new OpenIdConnectConfigurationRetriever();
        var documentRetriever = new HttpDocumentRetriever { RequireHttps = true };
        var configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
            AppleMetadata,
            retriever,
            documentRetriever);
        var configuration = await configurationManager.GetConfigurationAsync(cancellationToken);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKeys = configuration.SigningKeys,
            ValidateIssuer = true,
            ValidIssuer = AppleIssuer,
            ValidateAudience = true,
            ValidAudience = servicesId,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5),
        };

        var principal = handler.ValidateToken(identityToken, validationParameters, out _);
        var sub = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? principal.FindFirst("sub")?.Value
            ?? throw new InvalidOperationException("sub");
        var email = principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? principal.FindFirst("email")?.Value;
        return (sub, string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLowerInvariant());
    }

    private static string BuildApplePlaceholderEmail(string sub)
    {
        var safe = new string(sub.Where(c => char.IsLetterOrDigit(c) || c is '_' or '-').ToArray());
        if (safe.Length > 100)
        {
            safe = safe[..100];
        }

        return $"apple_{safe}@appleid.local";
    }

    private static async Task<User> UpsertOAuthUserAsync(
        AppDbContext db,
        string? googleSub,
        string? appleSub,
        string emailNorm,
        string displayName,
        CancellationToken cancellationToken)
    {
        User? user = null;
        if (!string.IsNullOrEmpty(googleSub))
        {
            user = await db.Users.FirstOrDefaultAsync(u => u.GoogleSub == googleSub, cancellationToken);
        }

        if (user is null && !string.IsNullOrEmpty(appleSub))
        {
            user = await db.Users.FirstOrDefaultAsync(u => u.AppleSub == appleSub, cancellationToken);
        }

        if (user is not null)
        {
            await db.Entry(user).Reference(u => u.CreditWallet).LoadAsync(cancellationToken);
            return user;
        }

        user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm, cancellationToken);
        if (user is not null)
        {
            if (!string.IsNullOrEmpty(googleSub))
            {
                if (!string.IsNullOrEmpty(user.GoogleSub) && user.GoogleSub != googleSub)
                {
                    throw new InvalidOperationException("CONFLICT:google");
                }

                user.GoogleSub = googleSub;
            }

            if (!string.IsNullOrEmpty(appleSub))
            {
                if (!string.IsNullOrEmpty(user.AppleSub) && user.AppleSub != appleSub)
                {
                    throw new InvalidOperationException("CONFLICT:apple");
                }

                user.AppleSub = appleSub;
            }

            if (string.IsNullOrWhiteSpace(user.DisplayName) && !string.IsNullOrWhiteSpace(displayName))
            {
                user.DisplayName = displayName.Trim();
            }

            await db.SaveChangesAsync(cancellationToken);
            await db.Entry(user).Reference(u => u.CreditWallet).LoadAsync(cancellationToken);
            return user;
        }

        var randomPw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var nu = new User
        {
            Email = emailNorm,
            PasswordHash = PasswordHasher.Hash(randomPw),
            DisplayName = string.IsNullOrWhiteSpace(displayName) ? emailNorm.Split('@')[0] : displayName.Trim(),
            GoogleSub = googleSub,
            AppleSub = appleSub,
        };

        db.Users.Add(nu);
        db.CreditWallets.Add(new CreditWallet
        {
            User = nu,
            Balance = 50,
        });
        db.CreditTransactions.Add(new CreditTransaction
        {
            User = nu,
            Amount = 50,
            Type = CreditTransactionType.Topup,
            Description = "Welcome credits",
        });
        await db.SaveChangesAsync(cancellationToken);
        await db.Entry(nu).Reference(u => u.CreditWallet).LoadAsync(cancellationToken);
        return nu;
    }

    private static async Task<IResult> SessionOkAsync(User user, AppDbContext db, CancellationToken cancellationToken)
    {
        await db.Entry(user).Reference(u => u.CreditWallet).LoadAsync(cancellationToken);
        var credits = user.CreditWallet?.Balance ?? 0;
        return Results.Ok(new
        {
            user.Id,
            user.Email,
            user.DisplayName,
            user.Role,
            Credits = credits,
        });
    }

    public sealed record GoogleCredentialRequest(string Credential);

    public sealed record AppleTokenRequest(string IdentityToken, string? FirstName, string? LastName, string? Email);
}
