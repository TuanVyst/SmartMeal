using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using Service.Interfaces;

namespace Service.Implements
{
    public class EmailService : IEmailService
    {
        private const int DefaultSmtpPort = 587;
        private static readonly TimeSpan SmtpTimeout = TimeSpan.FromSeconds(20);

        private readonly IMemoryCache _cache;
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IMemoryCache cache, IConfiguration config, ILogger<EmailService> logger)
        {
            _cache = cache;
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var host = _config["Email:Host"] ?? Environment.GetEnvironmentVariable("EMAIL_HOST") ?? "smtp.gmail.com";
            var port = int.TryParse(_config["Email:Port"] ?? Environment.GetEnvironmentVariable("EMAIL_PORT"), out var parsedPort)
                ? parsedPort
                : DefaultSmtpPort;
            var emailUser = _config["Email:EmailUser"] ?? Environment.GetEnvironmentVariable("EMAIL_USER");
            var emailPass = _config["Email:EmailPass"] ?? Environment.GetEnvironmentVariable("EMAIL_PASS");

            if (string.IsNullOrWhiteSpace(emailUser) || string.IsNullOrWhiteSpace(emailPass))
            {
                _logger.LogWarning("SMTP credentials are missing (Email:EmailUser / Email:EmailPass); email to {ToEmail} was not sent.", toEmail);
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Smart Meal", emailUser));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = body };

            using var client = new SmtpClient { Timeout = (int)SmtpTimeout.TotalMilliseconds };

            try
            {
                // 465 = implicit TLS, 587 = STARTTLS, 25 = opportunistic STARTTLS.
                var secureOptions = port switch
                {
                    465 => SecureSocketOptions.SslOnConnect,
                    587 => SecureSocketOptions.StartTls,
                    _ => SecureSocketOptions.StartTlsWhenAvailable
                };

                await client.ConnectAsync(host, port, secureOptions);
                await client.AuthenticateAsync(emailUser, emailPass);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent via SMTP {Host}:{Port} to {ToEmail}", host, port, toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email via SMTP {Host}:{Port} to {ToEmail}", host, port, toEmail);
            }
        }

        public async Task<string> RequestOtpAsync(string email)
        {
            var otpCode = new Random().Next(100000, 999999).ToString();

            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
            _cache.Set($"OTP_{email}", otpCode, cacheOptions);

            var subject = "Mã xác thực đăng nhập SmartMeal";

            var htmlBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2>Xin chào!</h2>
                    <p>Bạn vừa yêu cầu mã xác thực để đăng nhập vào SmartMeal.</p>
                    <p>Mã OTP của bạn là: <strong style='font-size: 24px; color: #2e6c80;'>{otpCode}</strong></p>
                    <p><i>Mã này sẽ hết hạn trong 5 phút. Vui lòng không chia sẻ cho người khác.</i></p>
                </div>";

            _logger.LogInformation("Queueing OTP email via SMTP for {Email}", email);

            _ = Task.Run(async () =>
            {
                try
                {
                    await SendEmailAsync(email, subject, htmlBody);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background OTP email task failed for {Email}", email);
                }
            });

            return otpCode;
        }
    }
}
