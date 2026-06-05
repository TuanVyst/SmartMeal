import { Outlet } from 'react-router-dom';
import logo from '../assets/SmartMealLogo.png';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-left-panel">
        <img src={logo} alt="SmartMeal" className="branding-logo" />
        <div className="auth-branding">
          <h2 className="branding-heading">Cook smarter, eat better</h2>
          <p className="branding-desc">
            Get personalized meal recommendations based on your ingredients,
            budget, and dietary preferences.
          </p>
          <div className="branding-features">
            <div className="branding-feature">
              <strong>Personalized meal ideas</strong>
              <p>Tailored to your taste and pantry</p>
            </div>
            <div className="branding-feature">
              <strong>Budget friendly recipes</strong>
              <p>Delicious meals for any budget</p>
            </div>
            <div className="branding-feature">
              <strong>Easy cooking for beginners</strong>
              <p>Step-by-step guidance included</p>
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
