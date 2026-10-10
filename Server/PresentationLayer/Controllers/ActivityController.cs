using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        private readonly ILogger<ActivityController> _logger;

        public ActivityController(AppDbContext ctx, ILogger<ActivityController> logger)
        {
            _ctx = ctx;
            _logger = logger;
        }

        [HttpPost("heartbeat")]
        public async Task<IActionResult> Heartbeat([FromBody] HeartbeatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.SessionToken))
            {
                return BadRequest(new { success = false, message = "SessionToken is required" });
            }

            try
            {
                Guid? accountId = null;
                var claim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (claim != null && Guid.TryParse(claim.Value, out Guid parsedId))
                {
                    accountId = parsedId;
                }

                var now = DateTime.UtcNow;
                var session = await _ctx.UserSessionLogs
                    .Where(s => s.SessionToken == request.SessionToken)
                    .OrderByDescending(s => s.LastHeartbeat)
                    .FirstOrDefaultAsync();

                // If no session found or inactive for more than 30 minutes, start a new session
                if (session == null || (now - session.LastHeartbeat).TotalMinutes > 30)
                {
                    session = new UserSessionLog
                    {
                        Session_id = Guid.NewGuid(),
                        SessionToken = request.SessionToken,
                        Account_id = accountId,
                        StartTime = now,
                        LastHeartbeat = now,
                        DurationSeconds = 0,
                        IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                        UserAgent = Request.Headers["User-Agent"].ToString()
                    };
                    _ctx.UserSessionLogs.Add(session);
                }
                else
                {
                    // Existing session: accumulate active seconds
                    var deltaSeconds = (int)(now - session.LastHeartbeat).TotalSeconds;
                    // Cap delta at 120s to guard against machine sleep / suspended background tabs
                    if (deltaSeconds > 0 && deltaSeconds <= 120)
                    {
                        session.DurationSeconds += deltaSeconds;
                    }
                    session.LastHeartbeat = now;

                    // If user logged in during an ongoing session, bind the accountId
                    if (session.Account_id == null && accountId.HasValue)
                    {
                        session.Account_id = accountId.Value;
                    }
                }

                await _ctx.SaveChangesAsync();
                return Ok(new { success = true, duration = session.DurationSeconds });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing activity heartbeat");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("record-recipe-select")]
        public async Task<IActionResult> RecordRecipeSelect([FromBody] RecordRecipeSelectRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.SessionToken))
            {
                return BadRequest(new { success = false, message = "SessionToken is required" });
            }

            try
            {
                Guid? accountId = null;
                var claim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (claim != null && Guid.TryParse(claim.Value, out Guid parsedId))
                {
                    accountId = parsedId;
                }

                var now = DateTime.UtcNow;
                var session = await _ctx.UserSessionLogs
                    .Where(s => s.SessionToken == request.SessionToken)
                    .OrderByDescending(s => s.LastHeartbeat)
                    .FirstOrDefaultAsync();

                Guid? validRecipeId = null;
                if (request.RecipeId.HasValue && await _ctx.Recipes.AnyAsync(r => r.Recipe_id == request.RecipeId.Value))
                {
                    validRecipeId = request.RecipeId.Value;
                }

                if (session == null || (now - session.LastHeartbeat).TotalMinutes > 30)
                {
                    session = new UserSessionLog
                    {
                        Session_id = Guid.NewGuid(),
                        SessionToken = request.SessionToken,
                        Account_id = accountId,
                        StartTime = now,
                        LastHeartbeat = now,
                        DurationSeconds = 0,
                        IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                        UserAgent = Request.Headers["User-Agent"].ToString(),
                        FirstRecipeSelectTime = now,
                        TimeToFirstRecipeSelectSeconds = 0,
                        FirstRecipe_id = validRecipeId
                    };
                    _ctx.UserSessionLogs.Add(session);
                }
                else
                {
                    if (!session.FirstRecipeSelectTime.HasValue)
                    {
                        var timeDiff = (int)Math.Max(0, (now - session.StartTime).TotalSeconds);
                        session.FirstRecipeSelectTime = now;
                        session.TimeToFirstRecipeSelectSeconds = timeDiff;
                        session.FirstRecipe_id = validRecipeId;
                    }

                    session.LastHeartbeat = now;
                    if (session.Account_id == null && accountId.HasValue)
                    {
                        session.Account_id = accountId.Value;
                    }
                }

                await _ctx.SaveChangesAsync();
                return Ok(new
                {
                    success = true,
                    timeToSelectSeconds = session.TimeToFirstRecipeSelectSeconds,
                    firstSelectTime = session.FirstRecipeSelectTime
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording recipe select event");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
