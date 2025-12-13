using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data;

namespace Hotel.Pages
{
    public class UpdatedataModel : PageModel
    {

        private readonly ILogger<UpdatedataModel> _logger;
        private readonly dbclass _t1;
        public UpdatedataModel(ILogger<UpdatedataModel> logger, dbclass t1)
        {
            _logger = logger;
            _t1 = t1;
        }
        public DataTable Table { get; set; }

        [BindProperty]
        public string name { get; set; }
        [BindProperty]
        public string email { get; set; }
        [BindProperty]
        public string password { get; set; }
        [BindProperty]
        public string message { get; set; }

        public void OnGet()
        {
            // Ensure the user is authenticated before attempting to get their data
            if (User.Identity.IsAuthenticated)
            {
                Table = _t1.ShowGuestTable(User.Identity.Name);
            }
            else
            {
                // Redirect to login page if not authenticated, or display an error
                RedirectToPage("/Login SingUp");
            }
        }
        public IActionResult OnPostSubmit()
        {
            if (User.Identity.IsAuthenticated)
            {
                message = _t1.UpdateGuest(User.Identity.Name, password, name, email);
                return RedirectToPage("/Userpage");
            }
            else
            {
                return RedirectToPage("/Login SingUp");
            }
        }
        public IActionResult OnPostCancel()
        {
            return RedirectToPage("/Userpage");

        }
    }
}
