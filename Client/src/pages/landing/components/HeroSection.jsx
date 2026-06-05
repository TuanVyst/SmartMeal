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
            Cook Your Own Meal, <span className="highlight">Your Way</span>
          </h1>
          <p className="hero-subtitle">
            Discover personalized meal plans, smart grocery lists, and delicious recipes
            tailored to your taste and budget. Start your healthy cooking journey today!
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-hero btn-hero-primary">Get Started</Link>
            <a href="#explore" className="btn-hero btn-hero-secondary">Explore Meals</a>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <img src={leaf2Img} alt="" className="hero-leaf l-1" />
          <img src={leaf2Img} alt="" className="hero-leaf l-2" />
          <img src={leaf2Img} alt="" className="hero-leaf l-3" />
          <div className="hero-bowl">
            <img src={saladImg} alt="Healthy meal bowl" className="hero-bowl-img" />
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
