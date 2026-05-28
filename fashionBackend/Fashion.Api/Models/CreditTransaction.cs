namespace Fashion.Api.Models;

public sealed class CreditTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int Amount { get; set; }
    public CreditTransactionType Type { get; set; } = CreditTransactionType.Topup;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}

public enum CreditTransactionType
{
    Topup = 1,
    Spend = 2,
    Refund = 3
}
