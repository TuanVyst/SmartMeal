import logo from '../../../assets/SmartMealLogo.png';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={logo} alt="SmartMeal" className="footer-logo-img" />
            <p>Cook your own meal, your way.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#explore">Explore Meals</a>
            <a href="#about">About</a>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy Policy</a>
          </div>
          <div className="footer-links">
            <h4>Follow Us</h4>
            <a href="#facebook">Facebook</a>
            <a href="#instagram">Instagram</a>
            <a href="#twitter">Twitter</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {year} SmartMeal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
