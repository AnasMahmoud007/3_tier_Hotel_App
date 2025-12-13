using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json; // For DataTableToList helper

namespace Hotel.Controllers
{
    [Route("api/user")]
    [ApiController]
    [Authorize] // All user-related endpoints require authentication
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly dbclass _dbclass;

        public UserController(ILogger<UserController> logger, dbclass dbclass)
        {
            _logger = logger;
            _dbclass = dbclass;
        }

        // Helper method to convert DataTable to List<Dictionary<string, object>>
        private List<Dictionary<string, object>> DataTableToList(DataTable table)
        {
            var list = new List<Dictionary<string, object>>();
            foreach (DataRow row in table.Rows)
            {
                var dict = new Dictionary<string, object>();
                foreach (DataColumn col in table.Columns)
                {
                    dict[col.ColumnName] = row[col];
                }
                list.Add(dict);
            }
            return list;
        }

        [HttpGet("profile")]
        public IActionResult GetUserProfile()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("User is not authenticated.");
            }

            try
            {
                DataTable userTable = _dbclass.ShowGuestTable(username);
                if (userTable.Rows.Count > 0)
                {
                    // Filter out password before returning
                    var userProfile = new Dictionary<string, object>();
                    foreach (DataColumn col in userTable.Columns)
                    {
                        if (col.ColumnName != "Password")
                        {
                            userProfile[col.ColumnName] = userTable.Rows[0][col];
                        }
                    }
                    return Ok(userProfile);
                }
                return NotFound(new { Message = "User profile not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile for {Username}.", username);
                return StatusCode(500, "Internal server error.");
            }
        }

        public class UpdateProfileRequest
        {
            [Required]
            public string Name { get; set; }
            [Required]
            [EmailAddress]
            public string UserInformation { get; set; } // Assuming UserInformation is email
            [Required]
            public string NewPassword { get; set; } // Assuming password update is part of this
        }

        [HttpPost("profile")]
        public IActionResult UpdateUserProfile([FromBody] UpdateProfileRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("User is not authenticated.");
            }

            try
            {
                // Note: The dbclass.UpdateGuest takes 'Password' not 'NewPassword'.
                // Need to ensure this aligns with how password updates are handled.
                // For now, assume NewPassword directly maps to Password.
                string result = _dbclass.UpdateGuest(username, request.NewPassword, request.Name, request.UserInformation);

                if (result == "1") // Assuming "1" means success
                {
                    return Ok(new { Message = "Profile updated successfully." });
                }
                return StatusCode(500, new { Message = "Failed to update profile." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile for {Username}.", username);
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("reservations/history")]
        public IActionResult GetUserReservationHistory()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("User is not authenticated.");
            }

            try
            {
                DataTable reservationHistory = _dbclass.ShowReservationHistoryTable(username);
                return Ok(DataTableToList(reservationHistory));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reservation history for {Username}.", username);
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
