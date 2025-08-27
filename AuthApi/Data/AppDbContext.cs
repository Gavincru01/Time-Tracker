using AuthApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>(e => 
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).IsRequired().HasMaxLength(320);
            e.Property(x => x.PasswordHash).IsRequired();
            e.Property(x => x.PasswordSalt).IsRequired();

        });

        b.Entity<RefreshToken>(e =>
        {
            e.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(r => r.TokenHash).IsUnique();
        });
    }
}