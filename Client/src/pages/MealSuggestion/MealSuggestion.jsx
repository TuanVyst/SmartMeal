import React, { useState, useMemo } from 'react';
import IngredientSidebar from '../../components/IngredientSidebar/IngredientSidebar';
import RecipeList from '../../components/RecipeList/RecipeList';
import { mockRecipesData as rawMockRecipes } from '../../utils/mockData';
import './MealSuggestion.css';

const MealSuggestion = () => {
  const [pantryItems, setPantryItems] = useState([]);

  const addIngredient = (ingredient) => {
    if (ingredient && !pantryItems.some(p => p.toLowerCase() === ingredient.toLowerCase())) {
      setPantryItems([...pantryItems, ingredient]);
    }
  };

  const removeIngredient = (ingredientToRemove) => {
    setPantryItems(pantryItems.filter(item => item.toLowerCase() !== ingredientToRemove.toLowerCase()));
  };

  // Calculate dynamic recipe data based on current pantry items
  const recipesWithMatchData = rawMockRecipes.map(recipe => {
    const allIngredients = recipe.requiredIngredients.map(ing => ({
      name: ing,
      possessed: pantryItems.some(pItem => pItem.toLowerCase() === ing.toLowerCase())
    }));
    
    const missingIngredients = allIngredients.filter(ing => !ing.possessed).map(ing => ing.name);
    const matchCount = allIngredients.filter(ing => ing.possessed).length;
    const matchPercentage = Math.round((matchCount / allIngredients.length) * 100);

    return {
      ...recipe,
      matchPercentage,
      missingIngredients,
      allIngredients
    };
  });

  // Sort recipes by match percentage descending
  const sortedRecipes = [...recipesWithMatchData].sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <div className="meal-suggestion-container">
      <div className="sidebar-section">
        <IngredientSidebar 
          pantryItems={pantryItems} 
          addIngredient={addIngredient} 
          removeIngredient={removeIngredient} 
        />
      </div>
      <div className="main-section">
        <RecipeList recipes={sortedRecipes} />
      </div>
    </div>
  );
};

export default MealSuggestion;
