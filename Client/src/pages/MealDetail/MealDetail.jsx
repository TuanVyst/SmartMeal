import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiHeart, FiArrowLeft } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import { BsCheckCircle } from 'react-icons/bs';
import { useFavorite } from '../../context/FavoriteContext';
import { mockRecipesData } from '../../utils/mockData';
import './MealDetail.css';

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorite();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    // Find recipe from mock data
    const found = mockRecipesData.find(r => r.id === id);
    if (found) {
      setRecipe(found);
    }
  }, [id]);

  if (!recipe) {
    return <div className="detail-loading">Loading recipe details...</div>;
  }

  const isFav = isFavorite(recipe.id);

  const handleSave = () => {
    toggleFavorite(recipe);
  };

  return (
    <div className="meal-detail-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <div className="detail-card">
        <div className="detail-image-wrapper">
          <img src={recipe.imageUrl} alt={recipe.title} className="detail-image" />
        </div>
        
        <div className="detail-content">
          <div className="detail-header">
            <h1 className="detail-title">{recipe.title}</h1>
            <button 
              className={`detail-save-btn ${isFav ? 'saved' : ''}`} 
              onClick={handleSave}
            >
              <FiHeart className={isFav ? 'fill-heart' : ''} />
              <span>{isFav ? 'Saved to Favorites' : 'Save to Favorite'}</span>
            </button>
          </div>

          <p className="detail-description">{recipe.description}</p>

          <div className="detail-meta">
            <div className="meta-box">
              <FiClock className="meta-icon" />
              <div>
                <span className="meta-label">Cooking Time</span>
                <span className="meta-value">{recipe.time}</span>
              </div>
            </div>
            <div className="meta-box">
              <span className="meta-icon">🔥</span>
              <div>
                <span className="meta-label">Nutrition</span>
                <span className="meta-value">{recipe.calories}</span>
              </div>
            </div>
            <div className="meta-box">
              <FaUtensils className="meta-icon" />
              <div>
                <span className="meta-label">Difficulty</span>
                <span className="meta-value">{recipe.difficulty}</span>
              </div>
            </div>
          </div>

          <div className="detail-body">
            <div className="ingredients-section">
              <h2>Ingredients</h2>
              <ul className="ingredients-list-detail">
                {recipe.requiredIngredients.map((ing, idx) => (
                  <li key={idx}>
                    <BsCheckCircle className="check-icon" /> {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div className="steps-section">
              <h2>Cooking Instructions</h2>
              <ol className="steps-list">
                {recipe.steps.map((step, idx) => (
                  <li key={idx}>
                    <span className="step-number">{idx + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
