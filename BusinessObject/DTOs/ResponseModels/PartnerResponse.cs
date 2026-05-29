namespace BusinessObject.Dtos.ResponseModels
{
    public class PartnerResponse
    {
        public Guid Partner_id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
