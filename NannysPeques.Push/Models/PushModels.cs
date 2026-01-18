namespace NannysPeques.Push.Models
{
    public class PushMessageDto
    {
        public string Title { get; set; } = "";
        public string Body { get; set; } = "";
        public string Url { get; set; } = "";
        public PushSubscriptionDto Subscription { get; set; } = new();
    }

    public class PushSubscriptionDto
    {
        public string Endpoint { get; set; } = "";
        public PushKeys Keys { get; set; } = new();
    }

    public class PushKeys
    {
        public string P256dh { get; set; } = "";
        public string Auth { get; set; } = "";
    }
}
