import { FiClock, FiZap } from 'react-icons/fi';
import saladImg from '../../../assets/Salad.png';
import avocadoImg from '../../../assets/Avocado.png';
import broccoliImg from '../../../assets/Broccoli.png';
import tomatoImg from '../../../assets/Tomato.png';

const meals = [
  {
    name: 'Garden Fresh Bowl',
    image: saladImg,
    cookTime: '25 min',
    calories: 450,
    difficulty: 'Easy',
    tags: ['Healthy', 'Protein'],
  },
  {
    name: 'Avocado Delight',
    image: avocadoImg,
    cookTime: '15 min',
    calories: 320,
    difficulty: 'Easy',
    tags: ['Vegan', 'Quick'],
  },
  {
    name: 'Green Goodness',
    image: broccoliImg,
    cookTime: '20 min',
    calories: 380,
    difficulty: 'Medium',
    tags: ['High Protein'],
  },
  {
    name: 'Tomato Harvest',
    image: tomatoImg,
    cookTime: '10 min',
    calories: 280,
    difficulty: 'Easy',
    tags: ['Vegan', 'Breakfast'],
  },
];

export default function PopularMeals() {
  return (
    <section id="explore" className="meals-section">
      <div className="meals-container">
        <h2 className="section-label">Popular Meals</h2>
        <h3 className="section-title">Most Loved Recipes</h3>
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
                  <span className={`meal-diff diff-${meal.difficulty.toLowerCase()}`}>{meal.difficulty}</span>
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
