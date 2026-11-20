using System.Globalization;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MyApp.Application.Abstractions;
using MyApp.Application.Interfaces;
using MyApp.Domain.Entities;
using MyApp.Domain.Enums;
using MyApp.Domain.ValueObjects;

namespace MyApp.Web.Startup;

internal static class SysAdminSeeder
{
    public static async Task SeedAsync(WebApplication app, CancellationToken cancellationToken)
    {
        var settings = app.Configuration.GetSection("SysAdminSeed");
        var configuredEmail = settings["Email"];
        if (string.IsNullOrWhiteSpace(configuredEmail))
            return;

        var email = EmailAddress.Create(configuredEmail);
        await using var scope = app.Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var existing = await users.GetByEmail(email, cancellationToken);
        if (existing is null)
        {
            var password = settings["Password"];
            if (string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException("Configurá SysAdminSeed:Password para crear el SysAdmin inicial.");

            if (!DateOnly.TryParseExact(settings["DateOfBirth"] ?? "2000-01-01", "yyyy-MM-dd",
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateOfBirth))
                throw new InvalidOperationException("SysAdminSeed:DateOfBirth debe tener el formato yyyy-MM-dd.");

            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
            var clock = scope.ServiceProvider.GetRequiredService<IClock>();
            var user = new User(settings["Name"] ?? "SysAdmin", dateOfBirth, email.Value,
                hasher.Hash(password), clock.UtcNow);
            user.SetRole(UserRole.SysAdmin);

            try
            {
                await users.Add(user, cancellationToken);
                app.Logger.LogInformation("Se creó el SysAdmin inicial.");
                return;
            }
            catch (DbUpdateException exception) when (exception.InnerException is
                SqliteException { SqliteExtendedErrorCode: 2067 })
            {
                // El índice único protege el mismo correo si arrancan dos instancias juntas.
                existing = await users.GetByEmail(email, cancellationToken);
                if (existing is null)
                    throw;
            }
        }

        if (existing.Role != UserRole.SysAdmin || !existing.IsActive)
            app.Logger.LogWarning("El correo del seeder pertenece a una cuenta que no es un SysAdmin activo. Se conservó la cuenta.");
    }
}
