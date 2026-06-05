
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Caching.Memory;
using MimeKit;
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
            // Đọc thông tin cấu hình từ biến môi trường
            var emailHost = Environment.GetEnvironmentVariable("EMAIL_HOST");
            var emailPort = int.Parse(Environment.GetEnvironmentVariable("EMAIL_PORT") ?? "587");
            var emailUser = Environment.GetEnvironmentVariable("EMAIL_USER");
            var emailPass = Environment.GetEnvironmentVariable("EMAIL_PASS");

            // Tạo nội dung bức thư
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Smart Meal", emailUser));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            // Xây dựng body (hỗ trợ cả HTML)
            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body, // Nếu bạn muốn gửi HTML, đổi TextBody thành HtmlBody
                TextBody = body
            };
            message.Body = bodyBuilder.ToMessageBody();

            // Kết nối SMTP Server và gửi
            using var client = new SmtpClient();
            try
            {
                // Tùy chọn StartTls giúp mã hóa dữ liệu an toàn
                await client.ConnectAsync(emailHost, emailPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(emailUser, emailPass);

                await client.SendAsync(message);
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }

        public async Task<string> RequestOtpAsync(string email)
        {
            // Sinh mã OTP
            var otpCode = new Random().Next(100000, 999999).ToString();

            // Lưu vào Cache (5 phút)
            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
            var otp = _cache.Set($"OTP_{email}", otpCode, cacheOptions);

            // 3. GỌI DỊCH VỤ GỬI EMAIL THẬT TẠI ĐÂY
            var subject = "Mã xác thực đăng nhập SmartMeal";

            // Bạn có thể thiết kế nội dung bằng HTML cho đẹp mắt
            var htmlBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2>Xin chào!</h2>
                    <p>Bạn vừa yêu cầu mã xác thực để đăng nhập vào SmartMeal.</p>
                    <p>Mã OTP của bạn là: <strong style='font-size: 24px; color: #2e6c80;'>{otpCode}</strong></p>
                    <p><i>Mã này sẽ hết hạn trong 5 phút. Vui lòng không chia sẻ cho người khác.</i></p>
                </div>";

            await SendEmailAsync(email, subject, htmlBody);

            return otp;
        }
    }
    }

