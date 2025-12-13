using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;
using System.Security.Permissions;
using System.Data;
using Hotel.Model;
using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;
using Microsoft.AspNetCore.Authorization; // Added for [Authorize]

namespace Hotel.Pages
{
    [Authorize] // Added to protect this page
    public class feedbackModel : PageModel
    {
        private ILogger<feedbackModel> _logger;
        private dbclass t1;
        

        [BindProperty]
        [Required]
        public string feedback { get; set; }
        [BindProperty]
        public int rate { get; set; }
        
        public string st { get; set; }
        public DataTable Table { get; set; }
        // public string Username1 { get; set; } // Removed as User.Identity.Name will be used directly
        public feedbackModel(ILogger<feedbackModel> logger, dbclass t1)
        {
            _logger = logger;
            this.t1 = t1;
        }
        public void OnGet()
        {
            // Ensure user is authenticated before attempting to get their data
            if (User.Identity.IsAuthenticated)
            {
                // Username1 = User.Identity.Name; // Not needed as User.Identity.Name can be used directly in Razor
                Table = t1.ShowFeadbackTable();
            }
            else
            {
                // Should not happen with [Authorize] attribute, but good for defensive coding
                RedirectToPage("/Login SingUp");
            }
        }
        // public IActionResult OnPostSubmit()
        // {
        //     if (User.Identity.IsAuthenticated)
        //     {
        //         Table = t1.ShowFeadbackTable();
        //         st = t1.InsertFeedback(Table.Rows.Count + 1, User.Identity.Name, DateTime.Now, feedback, rate);
        //         return RedirectToPage("/Userpage");
        //     }
        //     else
        //     {
        //         return RedirectToPage("/Login SingUp");
        //     }
        // }
    }
}
