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
    public class loginHEModel : PageModel
    {
        [BindProperty]
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        public string UserError { get; set; }
        [BindProperty]
        public string Select { get; set; }

        private readonly ILogger<loginHEModel> _logger;
        private readonly dbclass _t1;

        public loginHEModel(ILogger<loginHEModel> logger, dbclass t1)
        {
            _logger = logger;
            _t1 = t1;
        }
        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPost()
        {
            if (string.IsNullOrEmpty(Select))
            {
                UserError = "Select Your Role First";
                return Page();
            }

            if (ModelState.IsValid)
            {
                DataRow userRow = _t1.GetUser(Select, Username, Password);

                if (userRow != null)
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, Username),
                        new Claim(ClaimTypes.Role, Select)
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

                    _t1.Ausername1(Username);

                    switch (Select)
                    {
                        case "Admin":
                            return RedirectToPage("/Admin");
                        case "Manager":
                            return RedirectToPage("/Manager");
                        case "Staff":
                            return RedirectToPage("/Staff");
                    }
                }
            }

            UserError = "Username or password are incorrect";
            return Page();
        }
    }
}
