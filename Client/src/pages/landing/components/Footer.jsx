import logo from '../../../assets/SmartMealLogo.png';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={logo} alt="SmartMeal" className="footer-logo-img" />
            <p>Nấu bữa ăn của bạn, theo cách của bạn.</p>
          </div>
          <div className="footer-links">
            <h4>Liên kết nhanh</h4>
            <a href="#home">Trang chủ</a>
            <a href="#explore">Khám phá món ăn</a>
            <a href="#about">Giới thiệu</a>
          </div>
          <div className="footer-links">
            <h4>Hỗ trợ</h4>
            <a href="#faq">FAQ</a>
            <a href="#contact">Liên hệ</a>
            <a href="#privacy">Chính sách bảo mật</a>
          </div>
          <div className="footer-links">
            <h4>Theo dõi</h4>
            <a href="#facebook">Facebook</a>
            <a href="#instagram">Instagram</a>
            <a href="#twitter">Twitter</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {year} SmartMeal. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
}
