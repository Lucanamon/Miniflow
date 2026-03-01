using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Miniflow.Backend.Data;
using Miniflow.Backend.Models;

namespace Miniflow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ActivitiesController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static readonly HashSet<string> ValidTypes = new(StringComparer.OrdinalIgnoreCase)
        { "completed", "created", "board_updated", "deleted" };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetAll([FromQuery] int count = 10)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var list = await _db.Activities
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Timestamp)
            .Take(Math.Clamp(count, 1, 50))
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                Type = a.Type,
                Title = a.Title,
                Timestamp = a.Timestamp
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<ActivityDto>> Create([FromBody] CreateActivityRequest input)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(input.Type) || !ValidTypes.Contains(input.Type))
            return BadRequest(new { message = "Invalid activity type. Use: completed, created, board_updated, deleted." });
        if (string.IsNullOrWhiteSpace(input.Title))
            return BadRequest(new { message = "Title is required." });

        var activity = new Activity
        {
            UserId = userId,
            Type = input.Type.Trim(),
            Title = input.Title.Trim(),
            Timestamp = DateTime.UtcNow
        };

        _db.Activities.Add(activity);
        await _db.SaveChangesAsync();

        var dto = new ActivityDto
        {
            Id = activity.Id,
            Type = activity.Type,
            Title = activity.Title,
            Timestamp = activity.Timestamp
        };
        return CreatedAtAction(nameof(GetAll), null, dto);
    }
}

public class ActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class CreateActivityRequest
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
}
