import React from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import './RecipeList.css';

const RecipeList = ({ recipes }) => {
  return (
    <div className="recipe-list-container">
      <h2 className="results-title">{recipes.length} Recipes Found</h2>
      <div className="recipes-grid">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
