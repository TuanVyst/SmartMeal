import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiHeart, FiZap, FiPlus } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import { BsCheckCircle } from 'react-icons/bs';
import { useFavorite } from '../../context/FavoriteContext';
import { trackRecipeSelection } from '../../hooks/useActivityTracker';
import RecipeHealthScore from '../common/RecipeHealthScore';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onAddToDiary }) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorite();
  const { id, title, matchPercentage, description, time, difficulty, missingIngredients, allIngredients, calories, imageUrl } = recipe;

  const isFav = isFavorite(id);

  const handleSave = (e) => {
    e.stopPropagation();
    toggleFavorite(recipe);
  };

  const handleAddToDiary = (e) => {
    e.stopPropagation();
    if (onAddToDiary) {
      onAddToDiary(recipe);
    }
  };

  const handleCardClick = () => {
    if (id) {
      trackRecipeSelection(id);
    }
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="recipe-card" onClick={handleCardClick}>
      {imageUrl && (
        <div className="card-image-container">
          <img src={imageUrl} alt={title} className="card-image" loading="lazy" />
        </div>
      )}

      <div className="card-content">
        <h3 className="recipe-title">{title}</h3>
        {description && <p className="recipe-description">{description}</p>}
        
        <div className="recipe-meta">
          <span className="meta-item"><FiClock /> {time}</span>
          <span className="meta-item">
            <FaUtensils /> {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : difficulty === 'hard' ? 'Khó' : (difficulty || 'Dễ')}
          </span>
          {calories && <span className="meta-item" style={{fontWeight: 600}}><FiZap size={14} /> {calories}</span>}
        </div>

        {missingIngredients && missingIngredients.length > 0 && (
          <div className="missing-ingredients-box">
            <p className="box-title">Nguyên liệu còn thiếu:</p>
            <div className="missing-pills">
              {missingIngredients.map((item, idx) => (
                <span key={idx} className="missing-pill">{item}</span>
              ))}
            </div>
          </div>
        )}

        {allIngredients && allIngredients.length > 0 && (
          <div className="all-ingredients-section">
            <p className="section-title">Tất cả nguyên liệu:</p>
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

      {/* Cột các tương tác & chỉ số bên phải thẻ (theo đúng wireframe) */}
      <div className="card-right-actions" onClick={(e) => e.stopPropagation()}>
        {/* 1. Độ phù hợp (Màu xanh - sức khỏe người dùng) */}
        <div className="card-action-health-score" title="Độ tương thích sức khỏe">
          <RecipeHealthScore recipe={recipe} variant="card" />
        </div>

        {/* 2. Bộ sưu tập (Trái tim) */}
        <button 
          type="button"
          className={`save-btn ${isFav ? 'saved' : ''}`} 
          onClick={handleSave} 
          aria-label="Lưu vào bộ sưu tập"
          title={isFav ? "Bỏ lưu bộ sưu tập" : "Lưu vào bộ sưu tập"}
        >
          <FiHeart className={isFav ? 'fill-heart' : ''} />
        </button>

        {/* 3. Thêm vào nhật ký (Nút +) */}
        {onAddToDiary && (
          <button
            type="button"
            className="card-add-diary-btn"
            onClick={handleAddToDiary}
            title="Thêm vào nhật ký"
            aria-label="Thêm vào nhật ký"
          >
            <FiPlus size={18} />
          </button>
        )}

        {/* Phù hợp vàng (nguyên liệu khi lọc) - nằm ở góc dưới bên phải */}
        {matchPercentage !== undefined && (
          <div className="card-match-badge-container">
            <span className="match-badge">
              {matchPercentage}% Phù hợp
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
