using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System;
using System.Threading.Tasks;

namespace Hotel.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")] // Only Admin and Manager roles can access these endpoints
    public class AdminController : ControllerBase
    {
        private readonly ILogger<AdminController> _logger;
        private readonly dbclass _dbclass;

        public AdminController(ILogger<AdminController> logger, dbclass dbclass)
        {
            _logger = logger;
            _dbclass = dbclass;
        }

        // Helper method to convert DataTable to List<Dictionary<string, object>> and filter sensitive columns
        private List<Dictionary<string, object>> DataTableToList(DataTable table, params string[] excludeColumns)
        {
            var list = new List<Dictionary<string, object>>();
            foreach (DataRow row in table.Rows)
            {
                var dict = new Dictionary<string, object>();
                foreach (DataColumn col in table.Columns)
                {
                    if (!excludeColumns.Contains(col.ColumnName))
                    {
                        dict[col.ColumnName] = row[col];
                    }
                }
                list.Add(dict);
            }
            return list;
        }

        // DTOs for Add operations
        public class AddAdminRequest
        {
            public string UserName { get; set; }
            public string Password { get; set; }
        }

        public class AddManagerRequest
        {
            public string UserName { get; set; }
            public string Password { get; set; }
            public string ManagerName { get; set; }
            public int ModifyInformation { get; set; }
            public int InformationAboutStaff { get; set; }
            public int InformationAboutHotel { get; set; }
        }

        public class AddStaffRequest
        {
            public int StaffEmployeeID { get; set; }
            public int Accessibility { get; set; }
            public string SUsername { get; set; }
            public string Password { get; set; }
            public string Name { get; set; }
            public string Role { get; set; }
            public string ManagerUserName { get; set; }
            public string AdminUserName { get; set; }
        }

        public class AddRoomTypeRequest
        {
            public int RoomTypeID { get; set; }
            public string CategoryName { get; set; }
            public int Price { get; set; }
            public string Description { get; set; }
            public int bed { get; set; }
            public int bath { get; set; }
            public string photo { get; set; }
        }

        public class AddRoomRequest
        {
            public int RoomNumber { get; set; }
            public string CategoryName { get; set; }
            public decimal PricePerNight { get; set; }
        }

        public class AddServiceRequest
        {
            public int ServiceID { get; set; }
            public string AmenityName { get; set; }
            public string Description { get; set; }
            public int Availability { get; set; }
            public decimal AdditionalCharges { get; set; }
            public string icon { get; set; }
        }

        // DTOs for Update operations
        public class UpdateStaffRequest : AddStaffRequest
        {
            // StaffEmployeeID will be used from base class
        }
        public class UpdateRoomRequest : AddRoomRequest
        {
            // RoomNumber will be used from base class
        }
        public class UpdateServiceRequest : AddServiceRequest
        {
            // ServiceID will be used from base class
        }

        // DTOs for Delete operations
        public class DeleteStaffRequest
        {
            public int StaffEmployeeID { get; set; }
        }
        public class DeleteRoomRequest
        {
            public int RoomNumber { get; set; }
        }
        public class DeleteServiceRequest
        {
            public int ServiceID { get; set; }
        }

        // HTTP GET Endpoints (already present)
        [HttpGet("admins")]
        public IActionResult GetAdmins()
        {
            try
            {
                DataTable admins = _dbclass.ShowTable("Admin");
                return Ok(DataTableToList(admins, "Password")); // Exclude password
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin users.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("admin/{username}")] // New endpoint to get a single admin
        public IActionResult GetAdminByUsername(string username)
        {
            try
            {
                DataTable adminTable = _dbclass.ShowTable("Admin");
                var admin = adminTable.AsEnumerable().Where(row => row.Field<string>("UserName") == username);
                
                if (admin.Any())
                {
                    return Ok(DataTableToList(admin.CopyToDataTable(), "Password").FirstOrDefault());
                }
                return NotFound(new { message = "Admin not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin user by username {Username}.", username);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("managers")]
        public IActionResult GetManagers()
        {
            try
            {
                DataTable managers = _dbclass.ShowTable("Manager");
                return Ok(DataTableToList(managers, "Password")); // Exclude password
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting managers.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("staff")]
        public IActionResult GetStaff()
        {
            try
            {
                DataTable staff = _dbclass.ShowTable("Staff");
                return Ok(DataTableToList(staff, "Password")); // Exclude password
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting staff.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        
        [HttpGet("staff/{sUsername}")] // New endpoint to get a single staff
        public IActionResult GetStaffByUsername(string sUsername)
        {
            try
            {
                DataTable staffTable = _dbclass.ShowTable("Staff");
                var staff = staffTable.AsEnumerable().Where(row => row.Field<string>("SUsername") == sUsername);
                
                if (staff.Any())
                {
                    return Ok(DataTableToList(staff.CopyToDataTable(), "Password").FirstOrDefault());
                }
                return NotFound(new { message = "Staff not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting staff user by username {SUsername}.", sUsername);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("guests")]
        public IActionResult GetGuests()
        {
            try
            {
                DataTable guests = _dbclass.ShowTable("Guest");
                return Ok(DataTableToList(guests, "Password")); // Exclude password
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting guest users.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
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
                return StatusCode(500, "Internal server error: " + ex.Message);
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
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("room/{roomNumber}")] // New endpoint to get a single room
        public IActionResult GetRoomByNumber(int roomNumber)
        {
            try
            {
                DataTable roomTable = _dbclass.ShowTable("Room");
                var room = roomTable.AsEnumerable().Where(row => row.Field<int>("RoomNumber") == roomNumber);

                if (room.Any())
                {
                    return Ok(DataTableToList(room.CopyToDataTable()).FirstOrDefault());
                }
                return NotFound(new { message = "Room not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting room by number {RoomNumber}.", roomNumber);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("reservations")]
        public IActionResult GetReservations()
        {
            try
            {
                DataTable reservations = _dbclass.ShowTable("Reservation");
                return Ok(DataTableToList(reservations));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reservations.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("roommanagers")]
        public IActionResult GetRoomManagers()
        {
            try
            {
                DataTable roomManagers = _dbclass.ShowTable("RoomManager");
                return Ok(DataTableToList(roomManagers));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting room managers.");
                return StatusCode(500, "Internal server error: " + ex.Message);
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
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        
        [HttpGet("service/{serviceID}")] // New endpoint to get a single service
        public IActionResult GetServiceByID(int serviceID)
        {
            try
            {
                DataTable serviceTable = _dbclass.ShowTable("Services");
                var service = serviceTable.AsEnumerable().Where(row => row.Field<int>("ServiceID") == serviceID);

                if (service.Any())
                {
                    return Ok(DataTableToList(service.CopyToDataTable()).FirstOrDefault());
                }
                return NotFound(new { message = "Service not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service by ID {ServiceID}.", serviceID);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("feedback")]
        public IActionResult GetFeedback()
        {
            try
            {
                DataTable feedback = _dbclass.ShowFeadbackTable();
                return Ok(DataTableToList(feedback));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting feedback.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // HTTP POST Endpoints for Add operations
        [HttpPost("addadmin")]
        [Authorize(Roles = "Admin")] // Only Admin can add other Admins
        public async Task<IActionResult> AddAdmin([FromBody] AddAdminRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string result = _dbclass.InsertAdmin(request.UserName, request.Password);
                if (result == "1")
                {
                    return Ok(new { message = "Admin added successfully." });
                }
                return BadRequest(new { message = "Failed to add admin." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding admin.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("addmanager")]
        [Authorize(Roles = "Admin")] // Only Admin can add Managers
        public async Task<IActionResult> AddManager([FromBody] AddManagerRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string result = _dbclass.InsertManager(
                    request.UserName,
                    request.Password,
                    request.ManagerName,
                    request.ModifyInformation,
                    request.InformationAboutStaff,
                    request.InformationAboutHotel
                );
                if (result == "1")
                {
                    return Ok(new { message = "Manager added successfully." });
                }
                return BadRequest(new { message = "Failed to add manager." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding manager.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("addstaff")]
        [Authorize(Roles = "Admin,Manager")] // Admin or Manager can add Staff
        public async Task<IActionResult> AddStaff([FromBody] AddStaffRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string result = _dbclass.InsertStaff(
                    request.StaffEmployeeID,
                    request.Accessibility,
                    request.SUsername,
                    request.Password,
                    request.Name,
                    request.Role,
                    request.ManagerUserName,
                    request.AdminUserName
                );
                if (result == "1")
                {
                    return Ok(new { message = "Staff added successfully." });
                }
                return BadRequest(new { message = "Failed to add staff." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding staff.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("addroomtype")]
        [Authorize(Roles = "Admin,Manager")] // Admin or Manager can add Room Types
        public async Task<IActionResult> AddRoomType([FromBody] AddRoomTypeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string result = _dbclass.InsertRoomType(
                    request.RoomTypeID,
                    request.CategoryName,
                    request.Price,
                    request.Description,
                    request.bed,
                    request.bath,
                    request.photo
                );
                if (result == "1")
                {
                    return Ok(new { message = "Room type added successfully." });
                }
                return BadRequest(new { message = "Failed to add room type." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding room type.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("addroom")]
        [Authorize(Roles = "Admin,Manager")] // Admin or Manager can add Rooms
        public async Task<IActionResult> AddRoom([FromBody] AddRoomRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string result = _dbclass.InsertRoom(
                    request.RoomNumber,
                    request.CategoryName,
                    request.PricePerNight
                );
                if (result == "1")
                {
                    return Ok(new { message = "Room added successfully." });
                }
                return BadRequest(new { message = "Failed to add room." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding room.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("addservice")]
        [Authorize(Roles = "Admin,Manager")] // Admin or Manager can add Services
        public async Task<IActionResult> AddService([FromBody] AddServiceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string result = _dbclass.InsertService(
                    request.ServiceID,
                    request.AmenityName,
                    request.Description,
                    request.Availability,
                    request.AdditionalCharges,
                    request.icon
                );
                if (result == "1")
                {
                    return Ok(new { message = "Service added successfully." });
                }
                return BadRequest(new { message = "Failed to add service." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding service.");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // HTTP PUT Endpoints for Update operations
        [HttpPut("updatestaff")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateStaff([FromBody] UpdateStaffRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Assuming StaffEmployeeID is the primary key for update
                string result = _dbclass.UpdateStaff(
                    request.StaffEmployeeID,
                    request.Accessibility,
                    request.SUsername,
                    request.Password,
                    request.Name,
                    request.Role,
                    request.ManagerUserName,
                    request.AdminUserName
                );
                if (result == "1")
                {
                    return Ok(new { message = "Staff updated successfully." });
                }
                return BadRequest(new { message = "Failed to update staff." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating staff with ID {StaffEmployeeID}.", request.StaffEmployeeID);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("updateroom")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateRoom([FromBody] UpdateRoomRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Assuming RoomNumber is the primary key for update
                string result = _dbclass.UpdateRoom(
                    request.RoomNumber,
                    request.CategoryName,
                    request.PricePerNight
                );
                if (result == "1")
                {
                    return Ok(new { message = "Room updated successfully." });
                }
                return BadRequest(new { message = "Failed to update room." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating room number {RoomNumber}.", request.RoomNumber);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("updateservice")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateService([FromBody] UpdateServiceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Assuming ServiceID is the primary key for update
                string result = _dbclass.UpdateServices(
                    request.ServiceID,
                    request.AmenityName,
                    request.Description,
                    request.Availability,
                    request.AdditionalCharges,
                    request.icon // Add the icon parameter here
                );
                if (result == "1")
                {
                    return Ok(new { message = "Service updated successfully." });
                }
                return BadRequest(new { message = "Failed to update service." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service with ID {ServiceID}.", request.ServiceID);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // HTTP DELETE Endpoints for Delete operations
        [HttpDelete("deletestaff/{sUsername}")] // Route now accepts string username
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteStaff(string sUsername) // Change parameter type to string
        {
            try
            {
                string result = _dbclass.DeleteStaff(sUsername); // Call DeleteStaff with username
                if (result == "1")
                {
                    return Ok(new { message = "Staff deleted successfully." });
                }
                return BadRequest(new { message = "Failed to delete staff." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting staff with username {SUsername}.", sUsername);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpDelete("deleteroom/{roomNumber}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteRoom(int roomNumber)
        {
            try
            {
                string result = _dbclass.DeleteRoom(roomNumber);
                if (result == "1")
                {
                    return Ok(new { message = "Room deleted successfully." });
                }
                return BadRequest(new { message = "Failed to delete room." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting room number {RoomNumber}.", roomNumber);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpDelete("deleteservice/{serviceID}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteService(int serviceID)
        {
            try
            {
                string result = _dbclass.DeleteService(serviceID);
                if (result == "1")
                {
                    return Ok(new { message = "Service deleted successfully." });
                }
                return BadRequest(new { message = "Failed to delete service." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting service with ID {ServiceID}.", serviceID);
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}

