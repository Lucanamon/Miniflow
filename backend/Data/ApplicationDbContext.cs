using Microsoft.EntityFrameworkCore;
using Miniflow.Backend.Models;

namespace Miniflow.Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<Activity> Activities => Set<Activity>();
}

