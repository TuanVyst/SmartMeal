import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Sẵn sàng thay đổi cách nấu ăn của bạn?</h2>
        <p className="cta-desc">
          Tham gia cùng hàng ngàn người nấu ăn hạnh phúc. Tạo tài khoản miễn phí và bắt đầu
          hành trình lên kế hoạch bữa ăn cá nhân hóa ngay hôm nay.
        </p>
        <Link to="/register" className="btn-cta">Tạo tài khoản miễn phí</Link>
      </div>
    </section>
  );
}
