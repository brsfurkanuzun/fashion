namespace Fashion.Api.Models;

/// <summary>iyzico conversationId (MerchantOid) ile eşleşen bekleyen veya tamamlanan ödeme kaydı.</summary>
public sealed class PaymentOrder
{
    public string MerchantOid { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string PackageKey { get; set; } = string.Empty;
    public int PaymentAmountMinor { get; set; }
    public int CreditsToGrant { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAtUtc { get; set; }
}
