import React from 'react';
import { useFavorite } from '../../context/FavoriteContext';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import './Favorites.css';

export default function Favorites() {
  const { favorites } = useFavorite();

  return (
    <div className="favorites-page-container">
      <div className="favorites-header">
        <h2>Your Favorite Recipes</h2>
        <p>You have {favorites.length} saved recipes.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="no-favorites-message">
          <p>You haven't saved any recipes yet. Go to Meal Suggestions to find something you like!</p>
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
