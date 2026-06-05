import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Ready to Transform Your Cooking?</h2>
        <p className="cta-desc">
          Join thousands of happy cooks. Create your free account and start your
          personalized meal planning journey today.
        </p>
        <Link to="/register" className="btn-cta">Create Your Free Account</Link>
      </div>
    </section>
  );
}
