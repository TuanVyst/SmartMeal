import { FiHeart, FiBookOpen, FiDollarSign, FiUserCheck } from 'react-icons/fi';

const features = [
  {
    icon: <FiHeart size={32} />,
    title: 'Healthy Suggestions',
    desc: 'Get AI-powered meal recommendations based on your dietary needs and preferences.',
  },
  {
    icon: <FiBookOpen size={32} />,
    title: 'Easy Recipes',
    desc: 'Step-by-step recipes with simple ingredients anyone can follow and enjoy.',
  },
  {
    icon: <FiDollarSign size={32} />,
    title: 'Budget Friendly',
    desc: 'Smart meal planning that helps you save money while eating well every day.',
  },
  {
    icon: <FiUserCheck size={32} />,
    title: 'Personalized Advice',
    desc: 'Tailored nutrition tips and meal plans adapted to your lifestyle and goals.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="about" className="features-section">
      <div className="features-container">
        <h2 className="section-label">Why SmartMeal</h2>
        <h3 className="section-title">Everything You Need to Eat Better</h3>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
