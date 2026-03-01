using System.Text.Json.Serialization;

namespace Miniflow.Backend.Models;

public static class UserRole
{
    public const string User = "User";
    public const string Admin = "Admin";
    /// <summary>Built-in admin; cannot be removed or demoted.</summary>
    public const string RootAdmin = "RootAdmin";
}

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    /// <summary>Role: User, Admin, or RootAdmin. Default User. RootAdmin cannot be removed.</summary>
    public string Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;
}
