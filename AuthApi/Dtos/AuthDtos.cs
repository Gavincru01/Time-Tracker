namespace AuthApi.Dtos;

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(Guid Id, string Email, string AccessToken);
public record MeResponse(Guid Id, string Email);