using MailKit;

using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Caching.Memory;
using MimeKit;
using Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class EmailService : IEmailService
    {
        private readonly IMemoryCache _cache;

        public EmailService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var emailHost = Environment.GetEnvironmentVariable("EMAIL_HOST");
            var emailPort = int.Parse(Environment.GetEnvironmentVariable("EMAIL_PORT") ?? "587");
            var emailUser = Environment.GetEnvironmentVariable("EMAIL_USER");
            var emailPass = Environment.GetEnvironmentVariable("EMAIL_PASS");


            bool isDebugEnabled = Environment.GetEnvironmentVariable("SMTP_DEBUG") == "true";

            if (string.IsNullOrWhiteSpace(emailUser) || string.IsNullOrWhiteSpace(emailHost) || string.IsNullOrWhiteSpace(emailPass))
            {
                Console.WriteLine("\n==================================================");
                Console.WriteLine("⚠️ WARNING: Email environment variables (EMAIL_USER, EMAIL_HOST, EMAIL_PASS) are not configured.");
                Console.WriteLine($"[EMAIL MOCK] To: {toEmail}");
                Console.WriteLine($"[EMAIL MOCK] Subject: {subject}");
                Console.WriteLine($"[EMAIL MOCK] Body: {body}");
                Console.WriteLine("==================================================\n");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Smart Meal", emailUser));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body,
                TextBody = body
            };
            message.Body = bodyBuilder.ToMessageBody();

        
            using var client = isDebugEnabled
                ? new SmtpClient(new ProtocolLogger(Console.OpenStandardOutput()))
                : new SmtpClient();

            try
            {
                await client.ConnectAsync(emailHost, emailPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(emailUser, emailPass);
                await client.SendAsync(message);
            }
            catch (Exception ex)
            {
    
                Console.WriteLine($"[EMAIL ERROR] Thất bại khi gửi tới {toEmail}. Chi tiết: {ex.Message}");
                throw;
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }

        public async Task<string> RequestOtpAsync(string email)
        {
            var otpCode = new Random().Next(100000, 999999).ToString();

            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
            var otp = _cache.Set($"OTP_{email}", otpCode, cacheOptions);

            var subject = "Mã xác thực đăng nhập SmartMeal";

            var htmlBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2>Xin chào!</h2>
                    <p>Bạn vừa yêu cầu mã xác thực để đăng nhập vào SmartMeal.</p>
                    <p>Mã OTP của bạn là: <strong style='font-size: 24px; color: #2e6c80;'>{otpCode}</strong></p>
                    <p><i>Mã này sẽ hết hạn trong 5 phút. Vui lòng không chia sẻ cho người khác.</i></p>
                </div>";

            Console.WriteLine("Pushing email to background task...");

            _ = Task.Run(async () =>
            {
                try
                {
                    await SendEmailAsync(email, subject, htmlBody);
                    Console.WriteLine($"Background email sent successfully to {email}.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Background email task failed: {ex.Message}");
                }
            });

            return otp;
        }
    }
}
