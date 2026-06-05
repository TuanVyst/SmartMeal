import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import './IngredientSidebar.css';

const COMMON_INGREDIENTS = [
  'Beef', 'Pork', 'Fish', 'Shrimp',
  'Rice', 'Pasta', 'Bread',
  'Potatoes', 'Eggs', 'Tomatoes',
  'Onions', 'Garlic', 'Bell Peppers',
  'Carrots', 'Broccoli', 'Spinach',
  'Lettuce', 'Mushrooms', 'Cheese'
];

const IngredientSidebar = ({ pantryItems, addIngredient, removeIngredient }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      addIngredient(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="ingredient-sidebar">
      <h2 className="sidebar-title">Your Ingredients</h2>
      <div className="pantry-items-list">
        {pantryItems.map((item, index) => (
          <div key={index} className="pantry-item-pill">
            <span>{item}</span>
            <button className="remove-btn" onClick={() => removeIngredient(item)}>
              <FiX />
            </button>
          </div>
        ))}
      </div>

      <h2 className="sidebar-title">Add Custom Ingredient</h2>
      <div className="custom-input-group">
        <input 
          type="text" 
          placeholder="Enter ingredient name..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="add-btn" onClick={handleAdd}>
          <FiPlus className="plus-icon" /> Add
        </button>
      </div>

      <h2 className="sidebar-title">Common Ingredients</h2>
      <div className="common-ingredients-list">
        {COMMON_INGREDIENTS.map((item, index) => (
          <button 
            key={index} 
            className="common-ingredient-pill"
            onClick={() => addIngredient(item)}
          >
            + {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IngredientSidebar;
