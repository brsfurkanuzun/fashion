using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace Fashion.Api.Auth;

/// <summary>
/// Firebase ID token doğrulama — service account gerektirmez (Railway uyumlu).
/// </summary>
public static class FirebaseIdTokenVerifier
{
    private const string CertsUrl = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

    public static async Task<FirebaseIdClaims> VerifyAsync(string idToken, string projectId, CancellationToken cancellationToken = default)
    {
        var handler = new JwtSecurityTokenHandler();
        var keys = await LoadSigningKeysAsync(cancellationToken);

        var issuer = $"https://securetoken.google.com/{projectId}";
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = projectId,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5),
            IssuerSigningKeys = keys,
        };

        handler.ValidateToken(idToken, parameters, out var validated);
        var jwt = (JwtSecurityToken)validated;

        var email = jwt.Payload.TryGetValue("email", out var emailVal) ? emailVal?.ToString()?.Trim().ToLowerInvariant() : null;
        bool? emailVerified = null;
        if (jwt.Payload.TryGetValue("email_verified", out var evVal) && evVal is not null)
        {
            emailVerified = evVal switch
            {
                bool b => b,
                string s => bool.TryParse(s, out var p) && p,
                _ => null,
            };
        }

        var name = jwt.Payload.TryGetValue("name", out var nameVal) ? nameVal?.ToString() : null;
        var picture = jwt.Payload.TryGetValue("picture", out var picVal) ? picVal?.ToString() : null;
        var googleSub = ExtractGoogleSub(jwt.Payload)
            ?? jwt.Subject
            ?? (jwt.Payload.TryGetValue("user_id", out var uid) ? uid?.ToString() : null);

        if (string.IsNullOrEmpty(googleSub))
        {
            throw new SecurityTokenValidationException("sub claim yok.");
        }

        return new FirebaseIdClaims(googleSub, email, name, picture, emailVerified);
    }

    private static async Task<IList<SecurityKey>> LoadSigningKeysAsync(CancellationToken cancellationToken)
    {
        using var http = new HttpClient();
        var json = await http.GetStringAsync(CertsUrl, cancellationToken);
        var certs = JsonSerializer.Deserialize<Dictionary<string, string>>(json)
            ?? throw new InvalidOperationException("Firebase sertifikaları alınamadı.");

        var keys = new List<SecurityKey>();
        foreach (var (_, pem) in certs)
        {
            var cert = X509Certificate2.CreateFromPem(pem);
            keys.Add(new X509SecurityKey(cert));
        }

        return keys;
    }

    private static string? ExtractGoogleSub(JwtPayload payload)
    {
        if (!payload.TryGetValue("firebase", out var firebaseVal) || firebaseVal is null)
        {
            return null;
        }

        try
        {
            var json = firebaseVal is JsonElement el ? el.GetRawText() : JsonSerializer.Serialize(firebaseVal);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("identities", out var identities)
                && identities.TryGetProperty("google.com", out var googleArr)
                && googleArr.ValueKind == JsonValueKind.Array
                && googleArr.GetArrayLength() > 0)
            {
                return googleArr[0].GetString();
            }
        }
        catch
        {
            /* ignore */
        }

        return null;
    }
}

public sealed record FirebaseIdClaims(
    string Subject,
    string? Email,
    string? Name,
    string? Picture,
    bool? EmailVerified);
