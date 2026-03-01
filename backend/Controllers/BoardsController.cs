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
public class BoardsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public BoardsController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Board>>> GetAll()
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var boards = await _db.Boards
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .OrderBy(b => b.CreatedAt)
            .ToListAsync();

        return Ok(boards);
    }

    [HttpPost]
    public async Task<ActionResult<Board>> Create([FromBody] BoardInput input)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var board = new Board
        {
            UserId = userId,
            Name = input.Name ?? string.Empty,
            Description = input.Description,
            Color = input.Color ?? "blue"
        };

        _db.Boards.Add(board);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = board.Id }, board);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<Board>> Update(string id, [FromBody] BoardInput input)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var board = await _db.Boards.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (board is null) return NotFound(new { message = "Board not found" });

        if (!string.IsNullOrWhiteSpace(input.Name))
            board.Name = input.Name;
        if (input.Description != null)
            board.Description = input.Description;
        if (!string.IsNullOrWhiteSpace(input.Color))
            board.Color = input.Color;

        await _db.SaveChangesAsync();
        return Ok(board);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var board = await _db.Boards.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (board is null) return NotFound(new { message = "Board not found" });

        _db.Boards.Remove(board);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Board deleted" });
    }
}

public class BoardInput
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Color { get; set; }
}
