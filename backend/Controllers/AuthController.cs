using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Miniflow.Backend.Data;
using Miniflow.Backend.Models;

namespace Miniflow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AuthController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var existing = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existing is not null)
        {
            return Conflict(new { message = "Email already registered" });
        }

        var user = new User
        {
            Email = request.Email,
            Name = request.Name,
            PasswordHash = HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var response = BuildAuthResponse(user);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || !VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var response = BuildAuthResponse(user);
        return Ok(response);
    }

    private static string HashPassword(string password)
    {
        // Simple SHA256 hash for demo purposes. For production, use a stronger password hasher.
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }

    private static AuthResponse BuildAuthResponse(User user)
    {
        // For now, return a dummy token. Later you can replace this with a real JWT.
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());

        return new AuthResponse
        {
            Access_Token = token,
            ExpiresIn = 3600,
            User = new AuthUser
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name
            }
        };
    }
}