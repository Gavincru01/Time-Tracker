using System.Security.Cryptography;

namespace AuthApi.Security;

public static class PasswordHasher
{
    private const int SaltSize = 16; // 128 bit
    private const int KeySize = 32; // 256 bit
    private const int Iterations = 150_000; // Number of iterations for PBKDF2

    public static (string Hash, string Salt) Hash(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[SaltSize];
        rng.GetBytes(salt);

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var key = pbkdf2.GetBytes(KeySize);

        return (Convert.ToBase64String(key), Convert.ToBase64String(salt));
    }

    public static bool Verify(string password, string base64Hash, string base64Salt)
    {
        var salt = Convert.FromBase64String(base64Salt);
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var key = pbkdf2.GetBytes(KeySize);
        return CryptographicOperations.FixedTimeEquals(key, Convert.FromBase64String(base64Hash));
    }
}