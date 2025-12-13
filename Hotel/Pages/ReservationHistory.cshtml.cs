using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data;
using Microsoft.AspNetCore.Authorization; // Added for [Authorize]

namespace Hotel.Pages
{
    [Authorize] // Added to protect this page
    public class ReservationHistoryModel : PageModel
    {
        // Removed Username and Username1 properties as User.Identity.Name will be used directly
        // [BindProperty(SupportsGet = true)]
        // public string Username { get; set; }
        // public string Username1 { get; set; }

        private readonly ILogger<ReservationHistoryModel> _logger;
        private readonly dbclass _t1;
        public ReservationHistoryModel(ILogger<ReservationHistoryModel> logger, dbclass t1)
        {
            _logger = logger;
            _t1 = t1;
        }
        public DataTable Table { get; set; }
        public void OnGet()
        {
            if (User.Identity.IsAuthenticated)
            {
                // Username1 = User.Identity.Name; // Not needed as User.Identity.Name can be used directly
                Table = _t1.ShowReservationHistoryTable(User.Identity.Name);
            }
            else
            {
                RedirectToPage("/Login SingUp"); // Should not happen with [Authorize]
            }
        }
    }
}
