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
  const [activeTab, setActiveTab] = useState('instructions');

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
              <h2>Ingredient</h2>
              <ul className="ingredients-list-detail">
                {recipe.ingredients ? (
                  recipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <BsCheckCircle className="check-icon" /> <span><strong>{ing.amount}</strong> {ing.name}</span>
                    </li>
                  ))
                ) : (
                  recipe.requiredIngredients.map((ing, idx) => (
                    <li key={idx}>
                      <BsCheckCircle className="check-icon" /> {ing}
                    </li>
                  ))
                )}
              </ul>

              {recipe.nutrition && (
                <div className="nutrition-section-wrapper" style={{ marginTop: '2.5rem' }}>
                  <h2>Nutrition Facts</h2>
                  <div className="nutrition-facts-label">
                    <div className="nutri-row main-cal">
                      <span>Calories</span>
                      <strong>{recipe.nutrition.calories} kcal</strong>
                    </div>
                    <div className="nutri-divider-thick"></div>
                    
                    <div className="nutri-row">
                      <span>Protein</span>
                      <strong>{recipe.nutrition.protein}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Carbs</span>
                      <strong>{recipe.nutrition.carbs}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Fat</span>
                      <strong>{recipe.nutrition.fat}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Fiber</span>
                      <strong>{recipe.nutrition.fiber}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Sugar</span>
                      <strong>{recipe.nutrition.sugar}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Sodium</span>
                      <strong>{recipe.nutrition.sodium}mg</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Cholesterol</span>
                      <strong>{recipe.nutrition.cholesterol}mg</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="right-column-section">
              <div className="detail-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'instructions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('instructions')}
                >
                  hướng dẫn
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
                  onClick={() => setActiveTab('nutrition')}
                >
                  dinh dưỡng
                </button>
              </div>

              {activeTab === 'instructions' ? (
                <div className="tab-content instructions-tab">
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
              ) : (
                <div className="tab-content nutrition-tab">
                  <h2>Detailed Nutrition</h2>
                  <p className="nutrition-tab-intro">
                    Chi tiết giá trị dinh dưỡng đóng góp từ từng nguyên liệu trong công thức:
                  </p>
                  <div className="ingredient-nutrition-list">
                    {recipe.ingredients && recipe.ingredients.map((ing, idx) => {
                      if (ing.nutrition && (ing.nutrition.calories > 0 || ing.nutrition.protein > 0 || ing.nutrition.carbs > 0 || ing.nutrition.fat > 0)) {
                        return (
                          <div key={idx} className="ing-nutri-card">
                            <div className="ing-nutri-header">
                              <span className="ing-nutri-name">{ing.name}</span>
                              <span className="ing-nutri-amount">{ing.amount}</span>
                            </div>
                            <div className="ing-nutri-grid">
                              <div className="ing-nutri-stat cal">
                                <span className="stat-value">{ing.nutrition.calories}</span>
                                <span className="stat-label">Calories</span>
                              </div>
                              <div className="ing-nutri-stat pro">
                                <span className="stat-value">{ing.nutrition.protein}g</span>
                                <span className="stat-label">Protein</span>
                              </div>
                              <div className="ing-nutri-stat carb">
                                <span className="stat-value">{ing.nutrition.carbs}g</span>
                                <span className="stat-label">Carbs</span>
                              </div>
                              <div className="ing-nutri-stat fat">
                                <span className="stat-value">{ing.nutrition.fat}g</span>
                                <span className="stat-label">Fat</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
