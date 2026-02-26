using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Miniflow.Backend.Data;
using Miniflow.Backend.Models;

namespace Miniflow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public UsersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        var users = await _db.Users
            .AsNoTracking()
            .Select(u => new User
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.Name,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync();

        return Ok(users);
    }
}