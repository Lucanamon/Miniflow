namespace Miniflow.Backend.Models;

public class Board
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = "blue";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
