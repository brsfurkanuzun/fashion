namespace Fashion.Api.Models;

public sealed class ToolDefinition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ToolKey { get; set; } = string.Empty;
    public string Workspace { get; set; } = "cekim";
    public string Label { get; set; } = string.Empty;
    public int CreditCost { get; set; }
    public bool IsNew { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
