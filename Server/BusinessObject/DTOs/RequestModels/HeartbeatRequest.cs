using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos.RequestModels
{
    public class HeartbeatRequest
    {
        [Required]
        [MaxLength(128)]
        public string SessionToken { get; set; } = string.Empty;
    }
}
