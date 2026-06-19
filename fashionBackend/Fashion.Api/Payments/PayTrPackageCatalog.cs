using System.Globalization;

namespace Fashion.Api.Payments;

/// <summary>Fiyatlandırma sayfası ile uyumlu sabit paketler (tutar kuruş, kredi).</summary>
public static class PayTrPackageCatalog
{
    public const string StarterKey = "starter";

    /// <summary>Profesyonel kademeler: PRO_TIERS sırası (tl * 100 kuruş, kredi).</summary>
    public static readonly (int AmountMinor, int Credits)[] ProTiers =
    [
        (100_000, 2_500),
        (200_000, 5_000),
        (300_000, 7_500),
        (500_000, 15_000),
        (1_000_000, 35_000),
        (1_500_000, 55_000),
        (2_000_000, 75_000),
    ];

    public static readonly (int AmountMinor, int Credits) Starter = (50_000, 1_000);

    public static bool TryResolve(string? packageKey, out int amountMinor, out int credits, out string basketTitle)
    {
        amountMinor = 0;
        credits = 0;
        basketTitle = string.Empty;
        if (string.IsNullOrWhiteSpace(packageKey))
        {
            return false;
        }

        var key = packageKey.Trim().ToLowerInvariant();
        if (key == StarterKey)
        {
            (amountMinor, credits) = Starter;
            basketTitle = "Başlangıç paketi";
            return true;
        }

        if (key.StartsWith("pro-", StringComparison.Ordinal))
        {
            if (!int.TryParse(key.AsSpan(4), out var idx) || idx < 0 || idx >= ProTiers.Length)
            {
                return false;
            }

            (amountMinor, credits) = ProTiers[idx];
            basketTitle = $"Profesyonel paket ({(amountMinor / 100.0).ToString("N0", CultureInfo.GetCultureInfo("tr-TR"))} TL)";
            return true;
        }

        return false;
    }
}
