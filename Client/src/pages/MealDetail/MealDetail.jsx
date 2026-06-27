import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiHeart, FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import { BsCheckCircle } from 'react-icons/bs';
import { useFavorite } from '../../context/FavoriteContext';
import { mockRecipesData } from '../../utils/mockData';
import api from '../../services/api';
import './MealDetail.css';

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorite();
  const [recipe, setRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('instructions');
  const [expandedIngredients, setExpandedIngredients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleExpand = (idx) => {
    setExpandedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/recipe/${id}`);
        if (response.data && response.data.success) {
          const item = response.data.data;
          
          const recipeName = item.recipe_name || item.Recipe_name || "";
          const recipeId = item.recipe_id || item.Recipe_id || id;
          const description = item.description || item.Description || "";
          const instruction = item.instruction || item.Instruction || "";
          const prepTime = item.prepTime || item.PrepTime || 0;
          const cookTime = item.cookTime || item.CookTime || 0;
          const servings = item.servings || item.Servings || 1;
          const difficulty = item.difficulty || item.Difficulty || "";
          const recipeIngredients = item.recipeIngredients || item.RecipeIngredients || [];

          const mockRecipe = mockRecipesData.find(r => r.id === id || r.title.toLowerCase() === recipeName.toLowerCase());
          const imageUrl = mockRecipe ? mockRecipe.imageUrl : "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop";

          const steps = instruction
            ? instruction.split('\n')
                .map(step => step.replace(/^\d+\.\s*/, '').trim())
                .filter(step => step.length > 0)
            : [];

          const mappedIngredients = recipeIngredients.map(ri => {
            const quantity = ri.quantity || ri.Quantity || 0;
            const uom = ri.uom || ri.UOM || "";
            const amount = `${quantity} ${uom}`.trim();
            const ingName = ri.name || ri.Name || 'Nguyên liệu';
            
            let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 };
            const nv = ri.nutritionalValue || ri.NutritionalValue;
            if (nv) {
              const servingSize = nv.servingSize || nv.ServingSize || 1;
              const multiplier = quantity / servingSize;
              nutrition = {
                calories: Math.round((nv.calories || nv.Calories || 0) * multiplier * 10) / 10,
                protein: Math.round((nv.protein || nv.Protein || 0) * multiplier * 10) / 10,
                carbs: Math.round((nv.carbs || nv.Carbs || nv.carbohydrates || nv.Carbohydrates || 0) * multiplier * 10) / 10,
                fat: Math.round((nv.fat || nv.Fat || 0) * multiplier * 10) / 10,
                fiber: Math.round((nv.fiber || nv.Fiber || 0) * multiplier * 10) / 10,
                sugar: Math.round((nv.sugar || nv.Sugar || 0) * multiplier * 10) / 10,
                sodium: Math.round((nv.salt || nv.Salt || nv.sodium || nv.Sodium || 0) * multiplier * 10) / 10,
                cholesterol: Math.round((nv.cholesterol || nv.Cholesterol || 0) * multiplier * 10) / 10,
              };
            }
            
            return {
              name: ingName,
              amount,
              nutrition
            };
          });

          const totalNutri = mappedIngredients.reduce((acc, curr) => {
            acc.calories += curr.nutrition.calories;
            acc.protein += curr.nutrition.protein;
            acc.carbs += curr.nutrition.carbs;
            acc.fat += curr.nutrition.fat;
            acc.fiber += curr.nutrition.fiber;
            acc.sugar += curr.nutrition.sugar;
            acc.sodium += curr.nutrition.sodium;
            acc.cholesterol += curr.nutrition.cholesterol;
            return acc;
          }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 });

          const calculatedNutrition = {
            calories: Math.round(totalNutri.calories / servings),
            protein: Math.round(totalNutri.protein / servings),
            carbs: Math.round(totalNutri.carbs / servings),
            fat: Math.round(totalNutri.fat / servings),
            fiber: Math.round(totalNutri.fiber / servings),
            sugar: Math.round(totalNutri.sugar / servings),
            sodium: Math.round((totalNutri.sodium / servings) * 10) / 10,
            cholesterol: Math.round(totalNutri.cholesterol / servings),
          };

          setRecipe({
            id: recipeId,
            title: recipeName,
            description,
            time: `${prepTime + cookTime} phút`,
            difficulty,
            calories: `${calculatedNutrition.calories} kcal`,
            imageUrl,
            ingredients: mappedIngredients,
            steps,
            nutrition: calculatedNutrition,
            servings
          });
        } else {
          setError("Không thể tải chi tiết công thức.");
        }
      } catch (err) {
        console.error("Lỗi khi tải công thức:", err);
        setError("Đã xảy ra lỗi khi tải chi tiết công thức.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return <div className="detail-loading">Đang tải chi tiết công thức...</div>;
  }

  if (error || !recipe) {
    return <div className="detail-loading">{error || "Không tìm thấy công thức"}</div>;
  }

  const isFav = isFavorite(recipe.id);

  const handleSave = () => {
    toggleFavorite(recipe);
  };

  return (
    <div className="meal-detail-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Quay lại
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
              <span>{isFav ? 'Đã lưu vào Yêu thích' : 'Lưu vào Yêu thích'}</span>
            </button>
          </div>

          <p className="detail-description">{recipe.description}</p>

          <div className="detail-meta">
            <div className="meta-box">
              <FiClock className="meta-icon" />
              <div>
                <span className="meta-label">Thời gian nấu</span>
                <span className="meta-value">{recipe.time}</span>
              </div>
            </div>
            <div className="meta-box">
              <span className="meta-icon">🔥</span>
              <div>
                <span className="meta-label">Dinh dưỡng</span>
                <span className="meta-value">{recipe.calories}</span>
              </div>
            </div>
            <div className="meta-box">
              <FaUtensils className="meta-icon" />
              <div>
                <span className="meta-label">Độ khó</span>
                <span className="meta-value">{recipe.difficulty}</span>
              </div>
            </div>
          </div>

          <div className="detail-body">
            <div className="ingredients-section">
              <h2>Nguyên liệu</h2>
              <ul className="ingredients-list-detail">
                {recipe.ingredients ? (
                  recipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <BsCheckCircle className="check-icon" /> <span><strong>{ing.amount}</strong> {ing.name}</span>
                    </li>
                  ))
                ) : (
                  recipe.requiredIngredients && recipe.requiredIngredients.map((ing, idx) => (
                    <li key={idx}>
                      <BsCheckCircle className="check-icon" /> {ing}
                    </li>
                  ))
                )}
              </ul>

              {recipe.nutrition && (
                <div className="nutrition-section-wrapper" style={{ marginTop: '2.5rem' }}>
                  <h2>Thông tin dinh dưỡng</h2>
                  <div className="nutrition-facts-label">
                    <div className="nutri-row main-cal">
                      <span>Năng lượng</span>
                      <strong>{recipe.nutrition.calories} kcal</strong>
                    </div>
                    <div className="nutri-divider-thick"></div>
                    
                    <div className="nutri-row">
                      <span>Đạm</span>
                      <strong>{recipe.nutrition.protein}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Carb</span>
                      <strong>{recipe.nutrition.carbs}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Chất béo</span>
                      <strong>{recipe.nutrition.fat}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Chất xơ</span>
                      <strong>{recipe.nutrition.fiber}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Đường</span>
                      <strong>{recipe.nutrition.sugar}g</strong>
                    </div>
                    <div className="nutri-row">
                      <span>Muối</span>
                      <strong>{recipe.nutrition.sodium}g</strong>
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
                  Hướng dẫn
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
                  onClick={() => setActiveTab('nutrition')}
                >
                  Dinh dưỡng
                </button>
              </div>

              {activeTab === 'instructions' ? (
                <div className="tab-content instructions-tab">
                  <h2>Hướng dẫn nấu</h2>
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
                  <h2>Chi tiết dinh dưỡng</h2>
                  <p className="nutrition-tab-intro">
                    Chi tiết giá trị dinh dưỡng đóng góp từ từng nguyên liệu trong công thức:
                  </p>
                  <div className="ingredient-nutrition-list">
                    {recipe.ingredients && recipe.ingredients.map((ing, idx) => {
                      if (ing.nutrition && (ing.nutrition.calories > 0 || ing.nutrition.protein > 0 || ing.nutrition.carbs > 0 || ing.nutrition.fat > 0)) {
                        const isExpanded = !!expandedIngredients[idx];
                        return (
                          <div key={idx} className={`ing-nutri-card ${isExpanded ? 'expanded' : ''}`}>
                            <div 
                              className="ing-nutri-header clickable" 
                              onClick={() => toggleExpand(idx)}
                            >
                              <span className="ing-nutri-name">{ing.name}</span>
                              <div className="ing-nutri-header-right">
                                <span className="ing-nutri-amount">{ing.amount}</span>
                                <FiChevronDown className={`chevron-icon ${isExpanded ? 'rotated' : ''}`} />
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="ing-nutri-details">
                                <div className="ing-nutri-detail-row">
                                  <span>Năng lượng</span>
                                  <strong>{ing.nutrition.calories} kcal</strong>
                                </div>
                                <div className="ing-nutri-detail-row">
                                  <span>Đạm</span>
                                  <strong>{ing.nutrition.protein}g</strong>
                                </div>
                                <div className="ing-nutri-detail-row">
                                  <span>Carb</span>
                                  <strong>{ing.nutrition.carbs}g</strong>
                                </div>
                                <div className="ing-nutri-detail-row">
                                  <span>Chất béo</span>
                                  <strong>{ing.nutrition.fat}g</strong>
                                </div>
                              </div>
                            )}
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
