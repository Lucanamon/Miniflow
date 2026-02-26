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
}

public class AuthResponse
{
    public string Access_Token { get; set; } = string.Empty;
    public int? ExpiresIn { get; set; }
    public AuthUser? User { get; set; }
}

