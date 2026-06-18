import { FiHeart, FiBookOpen, FiDollarSign, FiUserCheck } from 'react-icons/fi';

const features = [
  {
    icon: <FiHeart size={32} />,
    title: 'Gợi ý lành mạnh',
    desc: 'Nhận gợi ý bữa ăn thông minh dựa trên nhu cầu dinh dưỡng và sở thích của bạn.',
  },
  {
    icon: <FiBookOpen size={32} />,
    title: 'Công thức dễ làm',
    desc: 'Công thức từng bước với nguyên liệu đơn giản, ai cũng có thể làm theo và thưởng thức.',
  },
  {
    icon: <FiDollarSign size={32} />,
    title: 'Tiết kiệm ngân sách',
    desc: 'Lập kế hoạch bữa ăn thông minh giúp bạn tiết kiệm tiền trong khi vẫn ăn uống lành mạnh.',
  },
  {
    icon: <FiUserCheck size={32} />,
    title: 'Tư vấn cá nhân',
    desc: 'Lời khuyên dinh dưỡng và kế hoạch bữa ăn được điều chỉnh theo lối sống và mục tiêu của bạn.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="about" className="features-section">
      <div className="features-container">
        <h2 className="section-label">Tại sao SmartMeal</h2>
        <h3 className="section-title">Mọi thứ bạn cần để ăn uống lành mạnh hơn</h3>
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
