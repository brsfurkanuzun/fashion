namespace Fashion.Api.Models;

public sealed class GenerationJob
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string ToolKey { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public int CreditCost { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Queued;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}

public enum JobStatus
{
    Queued = 1,
    Running = 2,
    Completed = 3,
    Failed = 4
}
