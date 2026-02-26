namespace Miniflow.Backend.Models;

public class TaskItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = string.Empty;
    public string? Board { get; set; }
    public DateTime? DueTime { get; set; }
    public bool Completed { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

