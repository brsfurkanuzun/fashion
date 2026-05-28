namespace Fashion.Api.Models;

public sealed class CreditWallet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int Balance { get; set; }

    public User User { get; set; } = null!;
}
