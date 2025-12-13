using Hotel.Model;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json; // For DataTableToList helper

namespace Hotel.Controllers
{
    [Route("api")]
    [ApiController]
    public class OfferController : ControllerBase
    {
        private readonly ILogger<OfferController> _logger;
        private readonly dbclass _dbclass;

        public OfferController(ILogger<OfferController> logger, dbclass dbclass)
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

        [HttpGet("offers")]
        public IActionResult GetOffers()
        {
            try
            {
                DataTable offersTable = _dbclass.ShowTable("Offers");
                return Ok(DataTableToList(offersTable));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting offers.");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
