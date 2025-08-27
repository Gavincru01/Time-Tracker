using System.Security.Claims;
using AuthApi.Data;
using AuthApi.Domain;
using AuthApi.Dtos;
using AuthApi.Security;
using AuthApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    AppDbContext db,
    JwtService jwt,
    RefreshTokenService rts
) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly JwtService _jwt = jwt;
    private readonly RefreshTokenService _rts = rts;

    [HttpPost("register")]
    public async Task<ActionResult<MeResponse>> Register(RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Email and password are required.");

        var exists = await _db.Users.AnyAsync(u => u.Email == req.Email);
        if (exists) return Conflict("Email already registered.");

        var (hash, salt) = PasswordHasher.Hash(req.Password);
        var user = new User { Email = req.Email, PasswordHash = hash, PasswordSalt = salt };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new MeResponse(user.Id, user.Email));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user is null) return Unauthorized("Invalid credentials.");
        if (!PasswordHasher.Verify(req.Password, user.PasswordHash, user.PasswordSalt))
            return Unauthorized("Invalid credentials.");

        var access = _jwt.CreateAccessToken(user);
        var (rawRefresh, saved) = await _rts.IssueAsync(user.Id);

        // httpOnly refresh cookie
        Response.Cookies.Append("refresh", rawRefresh, new CookieOptions
        {
            HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict,
            Path = "/api/auth/refresh", Expires = saved.ExpiresAt
        });

        return Ok(new AuthResponse(user.Id, user.Email, access));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<string>> Refresh()
    {
        if (!Request.Cookies.TryGetValue("refresh", out var raw)) return Unauthorized("No refresh cookie.");

        var (ok, current) = await _rts.ValidateAsync(raw);
        if (!ok || current is null) return Unauthorized("Invalid refresh token.");

        var user = await _db.Users.FindAsync(current.UserId);
        if (user is null) return Unauthorized();

        var next = await _rts.RotateAsync(current, user.Id);
        Response.Cookies.Append("refresh", (await _rts.IssueAsync(user.Id)).rawToken, new CookieOptions
        {
            HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict,
            Path = "/api/auth/refresh", Expires = next.ExpiresAt
        });

        var access = _jwt.CreateAccessToken(user);
        return Ok(access);
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<MeResponse> Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (id is null || email is null) return Unauthorized();
        return Ok(new MeResponse(Guid.Parse(id), email));
    }
}