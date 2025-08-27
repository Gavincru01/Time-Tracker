using System.Security.Cryptography;
using System.Text;
using AuthApi.Data;
using AuthApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Services;

public class RefreshTokenService(AppDbContext db, IConfiguration cfg)
{
    private readonly AppDbContext _db = db;
    private readonly int _daysToLive = cfg.GetValue<int>("RefreshTokens:DaysToLive", 14);

    public async Task<(string rawToken, RefreshToken saved)> IssueAsync(Guid userId)
    {
        var raw = GenerateRawToken();
        var hash = Hash(raw);

        var rt = new RefreshToken
        {
            UserId = userId,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddDays(_daysToLive)
        };
        
        _db.RefreshTokens.Add(rt);
        await _db.SaveChangesAsync();
        return (raw, rt);
    }

    public async Task<(bool ok, RefreshToken? current)> ValidateAsync(string raw)
    {
        var hash = Hash(raw);
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash);
        if (token is null) return (false, null);
        if (token.RevokedAt is not null || token.ExpiresAt < DateTime.UtcNow) return (false, token);
        return (true, token);
    }

    public async Task<RefreshToken> RotateAsync(RefreshToken current, Guid userId)
    {
        current.RevokedAt = DateTime.UtcNow;
        var (raw, next) = await IssueAsync(userId);
        current.ReplacedByTokenId = next.Id;
        await _db.SaveChangesAsync();
        return next;
    }

    public async Task RevokeAsync(RefreshToken token)
    {
        token.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    private static string GenerateRawToken()
    {
        var bytes = new byte[32]; // 256-bit
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string Hash(string raw)
    {
        // SHA256 is fine for *non-password* token hashing
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
        return Convert.ToBase64String(bytes);
    }
}