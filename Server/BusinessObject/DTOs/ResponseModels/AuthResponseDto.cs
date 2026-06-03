namespace BusinessObject.Dtos.ResponseModels
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public Guid AccountId { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
    }
}
