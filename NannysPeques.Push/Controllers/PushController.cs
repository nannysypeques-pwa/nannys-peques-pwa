using Microsoft.AspNetCore.Mvc;
using WebPush;
using NannysPeques.Push.Models;


namespace NannysPeques.Push.Controllers
{
    [ApiController]
    [Route("api/push")]
    public class PushController : ControllerBase
    {
        private readonly IConfiguration _config;

        public PushController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("send")]
        public IActionResult Send([FromBody] PushMessageDto msg)
        {
            var vapid = _config.GetSection("Vapid");

            var subscription = new PushSubscription(
                msg.Subscription.Endpoint,
                msg.Subscription.Keys.P256dh,
                msg.Subscription.Keys.Auth
            );

            var vapidDetails = new VapidDetails(
                vapid["Subject"],
                vapid["PublicKey"],
                vapid["PrivateKey"]
            );

            var client = new WebPushClient();

            var payload = System.Text.Json.JsonSerializer.Serialize(new
            {
                title = msg.Title,
                body = msg.Body,
                url = msg.Url
            });

            client.SendNotification(subscription, payload, vapidDetails);

            return Ok(new { ok = true });
        }
    }
}
