import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import './IngredientSidebar.css';

const COMMON_INGREDIENTS = [
  'Thịt bò', 'Thịt heo', 'Cá', 'Tôm',
  'Cơm/Gạo', 'Mì Ý', 'Bánh mì',
  'Khoai tây', 'Trứng', 'Cà chua',
  'Hành tây', 'Tỏi', 'Ớt chuông',
  'Cà rốt', 'Bông cải xanh', 'Rau bina',
  'Xà lách', 'Nấm', 'Phô mai'
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
      <h2 className="sidebar-title">Nguyên liệu của bạn</h2>
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

      <h2 className="sidebar-title">Thêm nguyên liệu tùy chọn</h2>
      <div className="custom-input-group">
        <input 
          type="text" 
          placeholder="Nhập tên nguyên liệu..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="add-btn" onClick={handleAdd}>
          <FiPlus className="plus-icon" /> Thêm
        </button>
      </div>

      <h2 className="sidebar-title">Nguyên liệu phổ biến</h2>
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
