namespace MyApp.Application.Exceptions;

public sealed class LoginRestrictedException(TimeSpan remaining) : Exception("Access restricted.")
{
    public long RemainingSeconds { get; } = Math.Max(1, (long)Math.Ceiling(remaining.TotalSeconds));
}
