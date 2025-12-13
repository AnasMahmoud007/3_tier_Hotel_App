using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization; // Added for [Authorize]

namespace Hotel.Pages
{
    [Authorize] // Added to protect this page
    public class reservationModel : PageModel
    {
        // Removed `username` property, as User.Identity.Name will be used directly
        [BindProperty]
        [Required]
        public string Room { get; set; }
        [BindProperty]
        [Required]
        public string Servicse { get; set; }
        [BindProperty]
        [Required]
        public DateTime checkin { get; set; }
        [BindProperty]
        [Required]
        public DateTime checkout { get; set; }
        [BindProperty]
        [Required]
        public int RoomN { get; set; }
        private ILogger<reservationModel> _logger;
        private dbclass t1;
        public DataTable Table { get; set; }
        public DataTable Table1 { get; set; }
        public DataTable Table2 { get; set; }
        public DataTable Table3 { get; set; }
        public string test { get; set; }

        public reservationModel(ILogger<reservationModel> logger, dbclass t1)
        {
            _logger = logger;
            this.t1 = t1;
        }

        public void OnGet()
        {
            // Ensure user is authenticated before attempting to get their data
            if (User.Identity.IsAuthenticated)
            {
                Table = t1.ShowTable("RoomType");
                Table1 = t1.ShowTable("Room");
                Table2 = t1.ShowTable("Services");
                Table3 = t1.ShowTable("Reservation");
                // username = User.Identity.Name; // Not needed as User.Identity.Name can be used directly in Razor
            }
            else
            {
                // Should not happen with [Authorize] attribute, but good for defensive coding
                RedirectToPage("/Login SingUp");
            }
        }
        public IActionResult OnPostSubmit()
        {
            if (User.Identity.IsAuthenticated)
            {
                // Re-populate Table3 in OnPostSubmit to avoid NullReferenceException
                Table3 = t1.ShowTable("Reservation");
                // Ensure correct username is passed for the reservation
                test = t1.InsertReservation(RoomN, User.Identity.Name, checkin, checkout);
                return RedirectToPage("/Userpage");
            }
            else
            {
                // This case should ideally not be reached due to [Authorize] attribute,
                // but defensive coding is good.
                return RedirectToPage("/Login SingUp");
            }
        }
    }
}
