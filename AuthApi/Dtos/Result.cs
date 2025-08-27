namespace AuthApi.Dtos;

public class Result<T>
{
    public bool Ok { get; init; }
    public string? Error { get; init; }
    public T? Value { get; init; }

    public static Result<T> Success(T value) => new() { Ok = true, Value = value };
    public static Result<T> Failure(string error) => new() { Ok = false, Error = error };
}