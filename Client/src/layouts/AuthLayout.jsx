import { Outlet, Link } from 'react-router-dom';
import logo from '../assets/SmartMealLogo.png';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-left-panel">
        <Link to="/" className="branding-logo-link">
          <img src={logo} alt="SmartMeal" className="branding-logo" />
        </Link>
        <div className="auth-branding">
          <h2 className="branding-heading">Nấu thông minh hơn, ăn ngon hơn</h2>
          <p className="branding-desc">
            Nhận gợi ý bữa ăn cá nhân hóa dựa trên nguyên liệu, ngân sách và sở thích ăn uống của bạn.
          </p>
          <div className="branding-features">
            <div className="branding-feature">
              <strong>Gợi ý bữa ăn cá nhân hóa</strong>
              <p>Phù hợp với khẩu vị và thực phẩm của bạn</p>
            </div>
            <div className="branding-feature">
              <strong>Công thức thân thiện ngân sách</strong>
              <p>Bữa ăn ngon cho mọi ngân sách</p>
            </div>
            <div className="branding-feature">
              <strong>Nấu ăn dễ dàng cho người mới</strong>
              <p>Hướng dẫn từng bước chi tiết</p>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right-panel">
        <Outlet />
      </div>
    </div>
  );
}
