namespace BlazorWebTemplate;

public static class SiteConfig
{
    public const string SiteName = "My Website";

    public static class Hero
    {
        public const string Title = "Welcome to My Website";
        public const string Subtitle = "A short, punchy line about what you do and who it helps.";
    }

    public static class About
    {
        public const string Heading = "About Us";
        public const string Body =
            "Replace this paragraph with a short description of your business, project, or organization. " +
            "Talk about what makes you different and who you serve.";
    }

    public static class ServicesSection
    {
        public const string Heading = "Our Services";

        public static readonly (string Title, string Description)[] Items =
        {
            ("Service One", "A short description of the first thing you offer."),
            ("Service Two", "A short description of the second thing you offer."),
            ("Service Three", "A short description of the third thing you offer."),
            ("Service Four", "A short description of the fourth thing you offer."),
        };
    }

    public static class Contact
    {
        public const string Heading = "Contact Us";
        public const string Phone = "+1 (555) 555-5555";
        public const string Email = "hello@example.com";
    }

    public static class Footer
    {
        public static string Text => $"© {DateTime.Now.Year} {SiteName}. All Rights Reserved.";
    }
}
