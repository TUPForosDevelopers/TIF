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
    private const string DevelopmentEmail = "sysadmin@example.com";
    private const string DevelopmentPasswordHash = "$2b$12$FkohxBAjL5ps20va5vmkKOXdW.pPcC7P2vuQ7UFApMinGXNV5s.UO";

    public static async Task SeedAsync(WebApplication app, CancellationToken cancellationToken)
    {
        var settings = app.Configuration.GetSection("SysAdminSeed");
        var configuredEmail = settings["Email"];
        var email = EmailAddress.Create(string.IsNullOrWhiteSpace(configuredEmail)
            ? DevelopmentEmail
            : configuredEmail);
        await using var scope = app.Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var existing = await users.GetByEmail(email, cancellationToken);
        if (existing is null)
        {
            var password = settings["Password"];
            if (string.IsNullOrWhiteSpace(password) && email.Value != DevelopmentEmail)
                throw new InvalidOperationException("Configurá SysAdminSeed:Password para crear el SysAdmin con un correo personalizado.");

            if (!DateOnly.TryParseExact(settings["DateOfBirth"] ?? "2000-01-01", "yyyy-MM-dd",
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateOfBirth))
                throw new InvalidOperationException("SysAdminSeed:DateOfBirth debe tener el formato yyyy-MM-dd.");

            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
            var clock = scope.ServiceProvider.GetRequiredService<IClock>();
            var hash = string.IsNullOrWhiteSpace(password) ? DevelopmentPasswordHash : hasher.Hash(password);
            var user = new User(settings["Name"] ?? "SysAdmin", dateOfBirth, email.Value, hash, clock.UtcNow);
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
