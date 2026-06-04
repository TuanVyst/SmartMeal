using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos.RequestModels
{
    public class RegisterRequest
    {
        [Required]
        [MinLength(3)]
        public string Username { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [MaxLength(150)]
        public string Email { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }
    }
}
