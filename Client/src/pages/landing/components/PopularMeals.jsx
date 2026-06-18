import { FiClock, FiZap } from 'react-icons/fi';
import saladImg from '../../../assets/Salad.png';
import avocadoImg from '../../../assets/Avocado.png';
import broccoliImg from '../../../assets/Broccoli.png';
import tomatoImg from '../../../assets/Tomato.png';

const meals = [
  {
    name: 'Salad Tươi Xanh',
    image: saladImg,
    cookTime: '25 phút',
    calories: 450,
    difficulty: 'Dễ',
    tags: ['Lành mạnh', 'Nhiều đạm'],
  },
  {
    name: 'Bơ Ngon Ngọt',
    image: avocadoImg,
    cookTime: '15 phút',
    calories: 320,
    difficulty: 'Dễ',
    tags: ['Thuần chay', 'Nhanh'],
  },
  {
    name: 'Bông Cải Xanh',
    image: broccoliImg,
    cookTime: '20 phút',
    calories: 380,
    difficulty: 'Trung bình',
    tags: ['Nhiều đạm'],
  },
  {
    name: 'Cà Chua Tươi',
    image: tomatoImg,
    cookTime: '10 phút',
    calories: 280,
    difficulty: 'Dễ',
    tags: ['Thuần chay', 'Sáng'],
  },
];

export default function PopularMeals() {
  return (
    <section id="explore" className="meals-section">
      <div className="meals-container">
        <h2 className="section-label">Món ăn phổ biến</h2>
        <h3 className="section-title">Công thức được yêu thích nhất</h3>
        <div className="meals-grid">
          {meals.map((meal, i) => (
            <div key={i} className="meal-card">
              <div className="meal-image-wrap">
                <img src={meal.image} alt={meal.name} loading="lazy" />
              </div>
              <div className="meal-info">
                <h4 className="meal-name">{meal.name}</h4>
                <div className="meal-meta">
                  <span><FiClock size={14} /> {meal.cookTime}</span>
                  <span><FiZap size={14} /> {meal.calories} cal</span>
                  <span className={`meal-diff diff-${meal.difficulty === 'Trung bình' ? 'medium' : meal.difficulty === 'Dễ' ? 'easy' : 'hard'}`}>{meal.difficulty}</span>
                </div>
                <div className="meal-tags">
                  {meal.tags.map((t, j) => (
                    <span key={j} className="meal-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
