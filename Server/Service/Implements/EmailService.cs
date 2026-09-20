using Microsoft.Extensions.Caching.Memory;
using SendGrid;
using SendGrid.Helpers.Mail;
using Service.Interfaces;

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
            // Thay vì Host và Port, ta chỉ cần API Key và Email đã xác thực
            var apiKey = Environment.GetEnvironmentVariable("SENDGRID_API_KEY");
            var emailUser = Environment.GetEnvironmentVariable("EMAIL_USER");

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(emailUser))
            {
                Console.WriteLine("\n⚠️ WARNING: SENDGRID_API_KEY or EMAIL_USER is missing.");
                return;
            }

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(emailUser, "Smart Meal");
            var to = new EmailAddress(toEmail);

            // Tạo email message
            var msg = MailHelper.CreateSingleEmail(from, to, subject, body, body);

            try
            {
                // Giao tiếp qua HTTP/REST API (cổng 443) - Không bao giờ bị chặn
                var response = await client.SendEmailAsync(msg);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[EMAIL SUCCESS] Sent via SendGrid API to {toEmail}");
                }
                else
                {
                    var errorBody = await response.Body.ReadAsStringAsync();
                    Console.WriteLine($"[EMAIL API ERROR] Status: {response.StatusCode}. Details: {errorBody}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL FATAL ERROR] Thất bại khi gọi API: {ex.Message}");
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

            Console.WriteLine("Pushing email to background task via SendGrid API...");

            _ = Task.Run(async () =>
            {
                try
                {
                    await SendEmailAsync(email, subject, htmlBody);
                    Console.WriteLine($"Background API request completed for {email}.");
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