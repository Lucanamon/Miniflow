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
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TasksController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetAll()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var tasks = await _db.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create([FromBody] TaskItem input)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var task = new TaskItem
        {
            Title = input.Title,
            Board = input.Board,
            DueTime = input.DueTime,
            Completed = input.Completed,
            UserId = userId
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = task.Id }, task);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<TaskItem>> Update(string id, [FromBody] TaskItem input)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task is null) return NotFound(new { message = "Task not found" });

        if (!string.IsNullOrWhiteSpace(input.Title))
            task.Title = input.Title;
        if (!string.IsNullOrWhiteSpace(input.Board))
            task.Board = input.Board;
        if (input.DueTime.HasValue)
            task.DueTime = input.DueTime;

        task.Completed = input.Completed;

        await _db.SaveChangesAsync();
        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task is null) return NotFound(new { message = "Task not found" });

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Task deleted" });
    }
}