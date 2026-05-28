namespace Fashion.Api.Models;

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public CreditWallet? CreditWallet { get; set; }
    public List<CreditTransaction> CreditTransactions { get; set; } = [];
    public List<GenerationJob> GenerationJobs { get; set; } = [];
    public List<GalleryItem> GalleryItems { get; set; } = [];
}
