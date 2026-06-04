import { Link } from 'react-router-dom';

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
          <div className="illustration-circle">
            <div className="food-icon plate">&#127858;</div>
            <div className="food-icon leaf">&#127807;</div>
            <div className="food-icon carrot">&#129365;</div>
            <div className="food-icon berry">&#127827;</div>
            <div className="food-icon avocado">&#129361;</div>
            <div className="food-icon bowl">&#127837;</div>
          </div>
        </div>
      </div>
    </section>
  );
}
