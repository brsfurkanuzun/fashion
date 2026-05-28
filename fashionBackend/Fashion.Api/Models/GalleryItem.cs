namespace Fashion.Api.Models;

public sealed class GalleryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? SourceJobId { get; set; }
    public string ToolKey { get; set; } = string.Empty;
    public string PreviewUrl { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
