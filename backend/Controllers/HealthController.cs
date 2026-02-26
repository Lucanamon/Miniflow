using Microsoft.AspNetCore.Mvc;

namespace Miniflow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            timestamp = DateTime.UtcNow.ToString("O")
        });
    }
}

