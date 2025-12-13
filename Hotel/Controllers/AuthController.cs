using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Hotel.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly dbclass _dbclass;

        public AuthController(ILogger<AuthController> logger, dbclass dbclass)
        {
            _logger = logger;
            _dbclass = dbclass;
        }

        public class LoginRequest
        {
            [Required]
            public string Username { get; set; }
            [Required]
            public string Password { get; set; }
        }

        public class RegisterRequest
        {
            [Required]
            public string Username { get; set; }
            [Required]
            public string Name { get; set; }
            [Required]
            [EmailAddress]
            public string Email { get; set; }
            [Required]
            public string Password { get; set; }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            (DataRow userRow, string role) = _dbclass.AuthenticateUserAndGetRole(request.Username, request.Password);

            if (userRow != null && role != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, request.Username),
                    new Claim(ClaimTypes.Role, role) // Use the determined role
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties { IsPersistent = true };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

                _logger.LogInformation("User {Username} successfully authenticated with role: {Role}", request.Username, role);
                return Ok(new { Message = "Login successful", Username = request.Username, Role = role }); // Return the role
            }

            return Unauthorized(new { Message = "Invalid username or password" });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if username already exists
            DataTable guestTable = _dbclass.ShowTable("Guest");
            foreach (DataRow row in guestTable.Rows)
            {
                if (request.Username.Equals(row["UserName"].ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(new { Message = "Username already exists" });
                }
            }

            string result = _dbclass.SignUp(request.Username, request.Password, request.Name, request.Email);

            if (result == "1") // Assuming "1" means success from dbclass.SignUp
            {
                return StatusCode(201, new { Message = "Registration successful", Username = request.Username });
            }
            // Handle other potential errors from SignUp, though it currently just returns "1" or throws
            return StatusCode(500, new { Message = "Registration failed unexpectedly" });
        }
    }
}
