using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Miniflow.Backend.Data;
using Miniflow.Backend.Models;

namespace Miniflow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{UserRole.Admin},{UserRole.RootAdmin}")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>Create a new admin user. Root admin or admin can call this.</summary>
    [HttpPost("users")]
    public async Task<ActionResult<AuthUser>> CreateAdmin([FromBody] RegisterRequest request)
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
            Role = UserRole.Admin,
            PasswordHash = HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new AuthUser
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role
        });
    }

    /// <summary>Update a user's role (promote to Admin or demote to User). Root admin cannot be changed.</summary>
    [HttpPatch("users/{id}/role")]
    public async Task<ActionResult<UserListDto>> UpdateUserRole(string id, [FromBody] UpdateUserRoleRequest? request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Role))
            return BadRequest(new { message = "Request body must include role (User or Admin)" });

        var user = await _db.Users.FindAsync(id);
        if (user is null)
            return NotFound(new { message = "User not found" });
        if (user.Role == UserRole.RootAdmin)
            return Forbid();

        var role = request.Role.Trim();
        var newRole = string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)
            ? UserRole.Admin
            : string.Equals(role, "User", StringComparison.OrdinalIgnoreCase)
                ? UserRole.User
                : null;
        if (newRole is null)
            return BadRequest(new { message = "Role must be User or Admin" });

        user.Role = newRole;
        user.UpdatedAt = DateTime.UtcNow;
        _db.Users.Update(user);
        await _db.SaveChangesAsync();

        return Ok(new UserListDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        });
    }

    /// <summary>Delete a user. Root admin cannot be removed.</summary>
    [HttpDelete("users/{id}")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
            return NotFound(new { message = "User not found" });
        if (user.Role == UserRole.RootAdmin)
            return Forbid();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
