import { Link } from 'react-router-dom';
import saladImg from '../../../assets/Salad.png';
import tomatoImg from '../../../assets/Tomato.png';
import broccoliImg from '../../../assets/Broccoli.png';
import avocadoImg from '../../../assets/Avocado.png';
import mushroomImg from '../../../assets/Mushroom.png';
import sauceImg from '../../../assets/Sauce.png';
import leaf2Img from '../../../assets/Leaf_2.png';

export default function HeroSection() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-slogan">
            Nấu bữa ăn của bạn, <span className="highlight">theo cách của bạn</span>
          </h1>
          <p className="hero-subtitle">
            Khám phá kế hoạch bữa ăn cá nhân hóa, danh sách thực phẩm thông minh và công thức nấu ăn ngon
            phù hợp với khẩu vị và ngân sách của bạn. Bắt đầu hành trình nấu ăn lành mạnh ngay hôm nay!
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-hero btn-hero-primary">Bắt đầu ngay</Link>
            <a href="#explore" className="btn-hero btn-hero-secondary">Khám phá món ăn</a>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <img src={leaf2Img} alt="" className="hero-leaf l-1" />
          <img src={leaf2Img} alt="" className="hero-leaf l-2" />
          <img src={leaf2Img} alt="" className="hero-leaf l-3" />
          <div className="hero-bowl">
            <img src={saladImg} alt="Bát salad healthy" className="hero-bowl-img" />
          </div>
          <img src={tomatoImg} alt="" className="floating-food f-tomato" />
          <img src={broccoliImg} alt="" className="floating-food f-broccoli" />
          <img src={avocadoImg} alt="" className="floating-food f-avocado" />
          <img src={mushroomImg} alt="" className="floating-food f-mushroom" />
          <img src={sauceImg} alt="" className="floating-food f-sauce" />
        </div>
      </div>
    </section>
  );
}
