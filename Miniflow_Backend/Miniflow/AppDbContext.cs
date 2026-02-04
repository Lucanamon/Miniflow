using Microsoft.EntityFrameworkCore;

namespace Miniflow;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
  public DbSet<User> Users { get; set; }
}
