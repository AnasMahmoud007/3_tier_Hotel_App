using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Threading.Tasks;

namespace Hotel.Pages
{
    public class Login_SingUpModel : PageModel
    {
        [BindProperty]
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        public string UserError { get; set; }
        public string Guest { get; set; }

        private readonly ILogger<Login_SingUpModel> _logger;
        private readonly dbclass _t1;

        public Login_SingUpModel(ILogger<Login_SingUpModel> logger, dbclass t1)
        {
            _logger = logger;
            _t1 = t1;
        }
        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPost()
        {
            _logger.LogInformation("Login attempt for Username: {Username}", Username);

            if (ModelState.IsValid)
            {
                DataRow userRow = _t1.GetUser("Guest", Username, Password);

                if (userRow != null)
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, Username),
                        new Claim(ClaimTypes.Role, "Guest")
                    };

                    var claimsIdentity = new ClaimsIdentity(
                        claims, CookieAuthenticationDefaults.AuthenticationScheme);

                    var authProperties = new AuthenticationProperties
                    {
                        IsPersistent = true
                    };

                    await HttpContext.SignInAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme,
                        new ClaimsPrincipal(claimsIdentity),
                        authProperties);

                    _t1.username1(Username);
                    _logger.LogInformation("Login successful for Username: {Username}", Username);
                    return RedirectToPage("/Userpage", new { Username = Username });
                }
            }
            UserError = "Username or password are incorrect";
            _logger.LogWarning("Login failed for Username: {Username}. UserError: {UserError}", Username, UserError);
            return Page();
        }
    }
}
