namespace BusinessObject.Dtos.ResponseModels
{
    public class PaymentResponseDto
    {
        public string CheckoutUrl { get; set; }
        public long OrderCode { get; set; }
        public int Amount { get; set; }
        public int OriginalAmount { get; set; }
        public double DiscountPercent { get; set; }
        public Guid? PromotionId { get; set; }
        public string QrCode { get; set; }
        public string PaymentLinkId { get; set; }
        public string TransferContent { get; set; }
    }
}
