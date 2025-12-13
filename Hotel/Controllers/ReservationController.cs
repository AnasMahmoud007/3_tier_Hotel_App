using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Text.Json; // Added for JsonSerializerOptions

namespace Hotel.Controllers
{
    [Route("api")] // Base route for all APIs in this controller
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly ILogger<ReservationController> _logger;
        private readonly dbclass _dbclass;

        public ReservationController(ILogger<ReservationController> logger, dbclass dbclass)
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

        [HttpGet("roomtypes")]
        public IActionResult GetRoomTypes()
        {
            try
            {
                DataTable roomTypes = _dbclass.ShowTable("RoomType");
                return Ok(DataTableToList(roomTypes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting room types.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("services")]
        public IActionResult GetServices()
        {
            try
            {
                DataTable services = _dbclass.ShowTable("Services");
                return Ok(DataTableToList(services));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting services.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("rooms")]
        public IActionResult GetRooms()
        {
            try
            {
                DataTable rooms = _dbclass.ShowTable("Room");
                return Ok(DataTableToList(rooms));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting rooms.");
                return StatusCode(500, "Internal server error");
            }
        }

        public class CreateReservationRequest
        {
            [Required]
            public int RoomN { get; set; } // RoomNumber
            [Required]
            public string CheckInDateString { get; set; }
            [Required]
            public string CheckOutDateString { get; set; }
            // Assuming Servicse (typo for Service) is handled separately or not mandatory for initial reservation creation
        }

        [Authorize] // Only authenticated users can make reservations
        [HttpPost("reservations")]
        public IActionResult CreateReservation([FromBody] CreateReservationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get username from authenticated user
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("User is not authenticated.");
            }

            // Explicitly parse dates
            if (!DateTime.TryParseExact(request.CheckInDateString, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime checkInDate))
            {
                return BadRequest(new { Message = "Invalid CheckInDate format. Expected YYYY-MM-DD." });
            }
            if (!DateTime.TryParseExact(request.CheckOutDateString, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime checkOutDate))
            {
                return BadRequest(new { Message = "Invalid CheckOutDate format. Expected YYYY-MM-DD." });
            }

            _logger.LogInformation("Attempting to insert reservation for RoomN: {RoomN}, Username: {Username}, CheckInDate: {CheckInDate}, CheckOutDate: {CheckOutDate}", request.RoomN, username, checkInDate, checkOutDate);

            try
            {
                string result = _dbclass.InsertReservation(request.RoomN, username, checkInDate, checkOutDate);

                if (result == "1") // Assuming "1" means success from dbclass.InsertReservation
                {
                    return StatusCode(201, new { Message = "Reservation created successfully." });
                }
                return StatusCode(500, new { Message = "Failed to create reservation." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating reservation for user {Username}.", username);
                return StatusCode(500, "Internal server error during reservation creation.");
            }
        }
    }
}
