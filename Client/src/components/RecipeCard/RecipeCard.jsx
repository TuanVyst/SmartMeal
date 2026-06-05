import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiHeart } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import { BsCheckCircle } from 'react-icons/bs';
import { useFavorite } from '../../context/FavoriteContext';
import './RecipeCard.css';

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorite();
  const { id, title, matchPercentage, description, time, difficulty, missingIngredients, allIngredients, calories, imageUrl } = recipe;

  const isFav = isFavorite(id);

  const handleSave = (e) => {
    e.stopPropagation();
    toggleFavorite(recipe);
  };

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipe/${id}`)}>
      {imageUrl && (
        <div className="card-image-container">
          <img src={imageUrl} alt={title} className="card-image" />
        </div>
      )}
      <div className="card-content">
        <div className="card-header">
          <h3 className="recipe-title">{title}</h3>
          <div className="header-actions">
            {matchPercentage !== undefined && <span className="match-badge">{matchPercentage}% Match</span>}
            <button className={`save-btn ${isFav ? 'saved' : ''}`} onClick={handleSave} aria-label="Save Recipe">
              <FiHeart className={isFav ? 'fill-heart' : ''} />
            </button>
          </div>
        </div>
        
        <p className="recipe-description">{description}</p>
        
        <div className="recipe-meta">
          <span className="meta-item"><FiClock /> {time}</span>
          <span className="meta-item"><FaUtensils /> {difficulty}</span>
          {calories && <span className="meta-item" style={{fontWeight: 600}}>🔥 {calories}</span>}
        </div>

        {missingIngredients && missingIngredients.length > 0 && (
          <div className="missing-ingredients-box">
            <p className="box-title">Missing ingredients:</p>
            <div className="missing-pills">
              {missingIngredients.map((item, idx) => (
                <span key={idx} className="missing-pill">{item}</span>
              ))}
            </div>
          </div>
        )}

        {allIngredients && allIngredients.length > 0 && (
          <div className="all-ingredients-section">
            <p className="section-title">All ingredients:</p>
            <div className="ingredients-list">
              {allIngredients.map((item, idx) => (
                <span key={idx} className={`ingredient-item ${item.possessed ? 'possessed' : 'missing'}`}>
                  {item.possessed ? <BsCheckCircle className="check-icon" /> : null}
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
