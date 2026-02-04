using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Miniflow.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
  private readonly AppDbContext _context;

  public UsersController(AppDbContext context)
  {
    _context = context;
  }

  [HttpGet]
  public async Task<IEnumerable<User>> Get()
  {
    var users = await _context.Users.ToListAsync();
    return users;
  }
}
