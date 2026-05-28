namespace Fashion.Api.Models;

public sealed class ChangelogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Type { get; set; } = "improvement";
    public DateTime PublishedAtUtc { get; set; } = DateTime.UtcNow;
}
