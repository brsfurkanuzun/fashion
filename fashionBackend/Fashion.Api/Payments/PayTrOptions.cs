namespace Fashion.Api.Payments;

public sealed class PayTrOptions
{
    public string MerchantId { get; set; } = string.Empty;
    public string MerchantKey { get; set; } = string.Empty;
    public string MerchantSalt { get; set; } = string.Empty;
    /// <summary>Örn. https://design.nulatechnology.com — merchant_ok / fail URL için.</summary>
    public string FrontendBaseUrl { get; set; } = "http://localhost:5173";
    public int TestMode { get; set; } = 1;
    public int DebugOn { get; set; } = 1;
    public int NoInstallment { get; set; } = 1;
    public int MaxInstallment { get; set; } = 0;
    public string Currency { get; set; } = "TL";
    public string Lang { get; set; } = "tr";
    public int TimeoutLimitMinutes { get; set; } = 30;
}
