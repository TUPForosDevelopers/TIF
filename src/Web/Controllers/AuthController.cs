
using MyApp.Application.Models;
using MyApp.Application.Services;
using MyApp.Application.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace MyApp.Web.Controllers;

[Route("api/auth")]
[ApiController]

public class AuthController : ControllerBase
{
    private readonly AuthServices _service;
    public AuthController(AuthServices service)
    {
        _service = service;
    }

    [HttpPost("login")]
    public async Task<ActionResult<string>> Authenticate(LoginUserDTO loginDTO, CancellationToken ct)
    {
        try
        {
            var token = await _service.Authenticate(loginDTO, ct);
            return Ok(token);
        }
        catch (LoginRestrictedException exception)
        {
            return Problem(
                statusCode: StatusCodes.Status401Unauthorized,
                title: "Access restricted",
                extensions: new Dictionary<string, object?>
                {
                    ["code"] = "access_restricted",
                    ["remainingSeconds"] = exception.RemainingSeconds
                });
        }
    }

}