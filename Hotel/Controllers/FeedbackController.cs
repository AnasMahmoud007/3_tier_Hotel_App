using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json; // For DataTableToList helper

namespace Hotel.Controllers
{
    [Route("api")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly ILogger<FeedbackController> _logger;
        private readonly dbclass _dbclass;

        public FeedbackController(ILogger<FeedbackController> logger, dbclass dbclass)
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

        [HttpGet("testimonials")]
        public IActionResult GetTestimonials()
        {
            try
            {
                DataTable feedbackTable = _dbclass.ShowFeadbackTable();
                return Ok(DataTableToList(feedbackTable));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting testimonials.");
                return StatusCode(500, "Internal server error");
            }
        }

        public class SubmitFeedbackRequest
        {
            [Required]
            public string Comments { get; set; }
            [Required]
            [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
            public int Rating { get; set; }
        }

        [Authorize]
        [HttpPost("feedback")]
        public IActionResult SubmitFeedback([FromBody] SubmitFeedbackRequest request)
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
                string result = _dbclass.InsertFeedback(username, DateTime.Now, request.Comments, request.Rating);

                if (result == "1") // Assuming "1" means success from dbclass.InsertFeedback
                {
                    return StatusCode(201, new { Message = "Feedback submitted successfully." });
                }
                return StatusCode(500, new { Message = "Failed to submit feedback." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting feedback for user {Username}.", username);
                return StatusCode(500, "Internal server error during feedback submission.");
            }
        }
    }
}
