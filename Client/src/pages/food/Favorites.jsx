import React from 'react';
import { useFavorite } from '../../context/FavoriteContext';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import './Favorites.css';

export default function Favorites() {
  const { favorites } = useFavorite();

  return (
    <div className="favorites-page-container">
      <div className="favorites-header">
        <h2>Công thức yêu thích</h2>
        <p>Bạn đã lưu {favorites.length} công thức.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="no-favorites-message">
          <p>Bạn chưa lưu công thức nào. Hãy đến Gợi ý món ăn để tìm công thức phù hợp!</p>
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
