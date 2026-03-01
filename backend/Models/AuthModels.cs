using System.Text.Json.Serialization;

namespace Miniflow.Backend.Models;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Name { get; set; }
}

public class AuthUser
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string Role { get; set; } = UserRole.User;
}

public class AuthResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("expiresIn")]
    public int? ExpiresIn { get; set; }

    public AuthUser? User { get; set; }
}

/// <summary>Request to promote or demote a user (Admin or User). RootAdmin cannot be changed.</summary>
public class UpdateUserRoleRequest
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty; // UserRole.User or UserRole.Admin
}

/// <summary>User list item for admin dashboard (no password).</summary>
public class UserListDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
