import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getIngredients, deleteIngredient, getIngredientTags } from '../../services/foodService';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import { resolveIngredientImageUrl } from '../../utils/ingredientImages';
import { getMultiplier, getEstimateWeightForPiece } from '../../utils/unitConverter';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiX, FiInfo } from 'react-icons/fi';
import './IngredientList.css';

// Standard adult daily targets for calculating percentages
const DAILY_TARGETS = {
  calories: 2000,
  protein: 75,
  carbs: 250,
  fat: 65,
  fiber: 25,
  sugar: 50,
  salt: 5,
  cholesterol: 300
};

export default function IngredientList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const dialog = useDialog();
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  
  // View Mode: 'hundred' (Standard 100g) or 'serving' (Everyday serving size)
  const [viewMode, setViewMode] = useState('hundred');

  // Custom calculators values
  const [globalWeight, setGlobalWeight] = useState(100); // in grams, for hundred mode
  const [globalMultiplier, setGlobalMultiplier] = useState(1); // multiplier factor, for serving mode
  
  // Modal states
  const [activeIngredient, setActiveIngredient] = useState(null);
  const [modalVal, setModalVal] = useState(100); // dynamically represents grams or multiplier based on viewMode

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingRes, tagRes] = await Promise.all([
        getIngredients(),
        getIngredientTags()
      ]);
      
      setIngredients(ingRes.data.data || []);
      setTags(tagRes.data.data || []);
    } catch (err) {
      console.error('Không thể tải danh sách nguyên liệu/nhãn:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    
    const ok = await dialog.confirm({ 
      title: 'Xóa nguyên liệu?', 
      message: 'Bạn có chắc chắn muốn xóa nguyên liệu này? Thao tác này không thể hoàn tác.', 
      confirmLabel: 'Xóa', 
      danger: true 
    });
    if (!ok) return;

    try {
      await deleteIngredient(id);
      setIngredients((prev) => prev.filter((i) => i.ingredient_id !== id));
      dialog.success('Thành công', 'Đã xóa nguyên liệu thành công.');
    } catch {
      dialog.error('Lỗi', 'Không thể xóa nguyên liệu.');
    }
  };

  const handleCardClick = (ing) => {
    setActiveIngredient(ing);
    setModalVal(viewMode === 'hundred' ? globalWeight : globalMultiplier);
  };

  const closeDetailModal = () => {
    setActiveIngredient(null);
  };

  // Sync state between weight / multiplier based on toggle
  const handleGlobalWeightChange = (val) => {
    const parsed = Math.max(1, parseInt(val) || 0);
    setGlobalWeight(parsed);
  };

  const handleGlobalMultiplierChange = (val) => {
    const parsed = Math.max(0.1, parseFloat(val) || 0.1);
    setGlobalMultiplier(parsed);
  };

  const handleModalValChange = (val) => {
    const parsed = viewMode === 'hundred'
      ? Math.max(1, parseInt(val) || 0)
      : Math.max(0.1, parseFloat(val) || 0.1);
    setModalVal(parsed);
  };

  // Helper to calculate display label and scaling factor for "Everyday serving" or "100g"
  const getEverydayUnitInfo = (i, multiplierValue) => {
    const nv = i.nutritional_value;
    const size = nv?.servingSize || 100;
    const unit = (nv?.servingUnit || 'g').trim();
    const name = i.name;

    // Check if the database has a customized EverydayUnit & EverydayWeight from the Admin UI
    if (nv?.everydayUnit && nv?.everydayWeight > 0) {
      const calculatedQty = Math.round(multiplierValue * 10) / 10;
      const calculatedWeight = Math.round(nv.everydayWeight * multiplierValue * 10) / 10;
      return {
        displayLabel: `${calculatedQty} ${nv.everydayUnit} (~${calculatedWeight}g)`,
        factor: getMultiplier(calculatedWeight, 'g', size, unit, name, nv.everydayWeight)
      };
    }

    let unitLabel = unit;
    if (unit === 'piece') unitLabel = 'cái';

    const isWeight = ['g', 'gram', 'grams'].includes(unit.toLowerCase());
    const isVolume = ['ml', 'milliliter', 'milliliters'].includes(unit.toLowerCase());

    if (isWeight) {
      const calculatedWeight = Math.round(100 * multiplierValue);
      return {
        displayLabel: `${calculatedWeight}g`,
        factor: getMultiplier(calculatedWeight, 'g', size, unit, name, nv?.everydayWeight)
      };
    }

    if (isVolume) {
      const calculatedVol = Math.round(100 * multiplierValue);
      return {
        displayLabel: `${calculatedVol}ml`,
        factor: getMultiplier(calculatedVol, 'ml', size, unit, name, nv?.everydayWeight)
      };
    }

    // Count-based (piece, quả, tép...)
    const estWeight = getEstimateWeightForPiece(name, unit, nv?.everydayWeight);
    const calculatedQty = Math.round(multiplierValue * 10) / 10;
    const calculatedWeight = Math.round(estWeight * multiplierValue * 10) / 10;

    return {
      displayLabel: `${calculatedQty} ${unitLabel} (~${calculatedWeight}g)`,
      factor: getMultiplier(multiplierValue, unit, size, unit, name, nv?.everydayWeight)
    };
  };

  // Calculate scaling factor based on current display mode
  const getNormalizedNutrition = (nv, ingredient, targetVal) => {
    if (!nv) return null;
    
    let factor = 1;
    if (viewMode === 'hundred') {
      const standardSize = nv.servingSize || 100;
      const sUnit = nv.servingUnit || 'g';
      // Calculate multiplier to scale standard nutrition to standard 100g, then multiply by targetVal
      factor = getMultiplier(targetVal, 'g', standardSize, sUnit, ingredient.name, nv.everydayWeight);
    } else {
      // Everyday serving mode: targetVal is the portion multiplier
      const unitInfo = getEverydayUnitInfo(ingredient, targetVal);
      factor = unitInfo.factor;
    }

    return {
      calories: Math.round((nv.calories || 0) * factor * 10) / 10,
      protein: Math.round((nv.protein || 0) * factor * 10) / 10,
      carbs: Math.round((nv.carbohydrates || nv.carbs || 0) * factor * 10) / 10,
      fat: Math.round((nv.fat || 0) * factor * 10) / 10,
      fiber: Math.round((nv.fiber || 0) * factor * 10) / 10,
      sugar: Math.round((nv.sugar || 0) * factor * 10) / 10,
      salt: Math.round((nv.salt || nv.sodium || 0) * factor * 10) / 10,
      cholesterol: Math.round((nv.cholesterol || 0) * factor * 10) / 10
    };
  };

  // Filter logic
  const filteredIngredients = ingredients.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'All' || 
      (i.ingredientLabels && i.ingredientLabels.some(l => l.labelName === selectedTag));
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="ingredients-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading" style={{ fontSize: '18px', color: '#22c55e', fontWeight: 600 }}>Đang tải danh sách nguyên liệu...</div>
      </div>
    );
  }

  const tagNames = ['All', ...tags.map(t => t.name)];
  const modalNutrition = activeIngredient ? getNormalizedNutrition(activeIngredient.nutritional_value, activeIngredient, modalVal) : null;
  const modalUnitInfo = activeIngredient ? getEverydayUnitInfo(activeIngredient, modalVal) : null;

  return (
    <div className="ingredients-page">
      {/* Header section */}
      <div className="ingredients-header">
        <div>
          <h1>Tra cứu Dinh dưỡng Nguyên liệu</h1>
          <p>Tìm hiểu các chỉ số dinh dưỡng, lượng kcal, protein, carbs, fat của các thực phẩm quen thuộc</p>
        </div>
        {isAdmin && (
          <Link to="/ingredients/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus /> Thêm nguyên liệu mới
          </Link>
        )}
      </div>

      {/* Control panel: search, view toggle, categories and weight/portion calculator */}
      <div className="ingredients-controls">
        <div className="search-filter-row" style={{ justifyContent: 'space-between' }}>
          <div className="search-box-wrapper" style={{ maxWidth: '60%' }}>
            <FiSearch className="search-box-icon" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm nguyên liệu (ví dụ: cá hồi, cà chua...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 100g vs Everyday serving toggle */}
          <div className="view-mode-toggle-container" style={{ margin: 0 }}>
            <button
              className={`view-mode-btn ${viewMode === 'hundred' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('hundred');
                setGlobalMultiplier(1);
              }}
            >
              Tiêu chuẩn 100g
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'serving' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('serving');
                setGlobalWeight(100);
              }}
            >
              Đơn vị thường ngày
            </button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="category-tabs">
          {tagNames.map(tagName => (
            <button
              key={tagName}
              className={`category-tab ${selectedTag === tagName ? 'active' : ''}`}
              onClick={() => setSelectedTag(tagName)}
            >
              {tagName === 'All' ? 'Tất cả thực phẩm' : tagName}
            </button>
          ))}
        </div>

        {/* Weight / Portion Calculator Panel */}
        <div className="calculator-panel">
          <div className="calculator-info">
            {viewMode === 'hundred' ? (
              <>
                <h4>Bảng tính trọng lượng tự động (Gram)</h4>
                <p>Điều chỉnh số gram để tính nhanh tổng dinh dưỡng nạp vào</p>
              </>
            ) : (
              <>
                <h4>Bộ nhân tỉ lệ khẩu phần mặc định</h4>
                <p>Điều chỉnh số lượng khẩu phần ăn thường ngày (tép, quả, cái, ml...)</p>
              </>
            )}
          </div>
          <div className="calculator-inputs">
            {viewMode === 'hundred' ? (
              <>
                <div className="weight-slider-wrapper">
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={globalWeight}
                    onChange={(e) => handleGlobalWeightChange(e.target.value)}
                  />
                </div>
                <div className="weight-input-wrapper">
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={globalWeight}
                    onChange={(e) => handleGlobalWeightChange(e.target.value)}
                  />
                  <span className="weight-unit-label">gram (g)</span>
                </div>
              </>
            ) : (
              <>
                <div className="weight-slider-wrapper">
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={globalMultiplier}
                    onChange={(e) => handleGlobalMultiplierChange(e.target.value)}
                  />
                </div>
                <div className="weight-input-wrapper">
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={globalMultiplier}
                    onChange={(e) => handleGlobalMultiplierChange(e.target.value)}
                  />
                  <span className="weight-unit-label">lần</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid containing cards */}
      <div className="ingredients-grid">
        {filteredIngredients.map((i) => {
          // Calculate values based on viewMode
          const normNutrition = getNormalizedNutrition(
            i.nutritional_value, 
            i, 
            viewMode === 'hundred' ? globalWeight : globalMultiplier
          );
          
          const firstLabel = i.ingredientLabels && i.ingredientLabels[0]?.labelName;
          
          // Generate portion label description
          let portionLabel = '';
          if (viewMode === 'hundred') {
            portionLabel = `Khẩu phần: ${globalWeight} g`;
          } else {
            const unitInfo = getEverydayUnitInfo(i, globalMultiplier);
            portionLabel = `Khẩu phần: ${unitInfo.displayLabel}`;
          }
          
          return (
            <div 
              key={i.ingredient_id} 
              className="ingredient-card"
              onClick={() => handleCardClick(i)}
            >
              {/* Card Image with tag overlay */}
              <div className="ingredient-card-image">
                <img 
                  src={resolveIngredientImageUrl(i.imageUrl, i.name)} 
                  alt={i.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&h=150&auto=format&fit=crop';
                  }}
                />
                {firstLabel && <span className="ingredient-tag-badge">{firstLabel}</span>}
              </div>

              {/* Admin Overlay Actions */}
              {isAdmin && (
                <div className="admin-card-actions">
                  <button 
                    className="admin-action-btn edit-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/ingredients/${i.ingredient_id}/edit`);
                    }}
                    title="Chỉnh sửa"
                  >
                    <FiEdit size={14} />
                  </button>
                  <button 
                    className="admin-action-btn delete-btn" 
                    onClick={(e) => handleDelete(e, i.ingredient_id)}
                    title="Xóa"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              )}

              {/* Card Main Body */}
              <div className="ingredient-card-content">
                <h3 className="ingredient-name">{i.name}</h3>
                <p className="ingredient-price-tag" style={{ marginBottom: 6 }}>
                  Giá TB: ~${i.averagePrice?.toFixed(2)}
                </p>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginBottom: 14 }}>
                  {portionLabel}
                </div>

                {/* Macro nutritional blocks */}
                <div className="ingredient-quick-macros">
                  <div className="macro-box calories-box">
                    <span className="macro-box-val">{normNutrition?.calories ?? '—'}</span>
                    <span className="macro-box-lbl">kcal</span>
                  </div>
                  <div className="macro-box">
                    <span className="macro-box-val" style={{ color: '#3b82f6' }}>
                      {normNutrition?.protein !== undefined ? `${normNutrition.protein}g` : '—'}
                    </span>
                    <span className="macro-box-lbl">Đạm</span>
                  </div>
                  <div className="macro-box">
                    <span className="macro-box-val" style={{ color: '#10b981' }}>
                      {normNutrition?.carbs !== undefined ? `${normNutrition.carbs}g` : '—'}
                    </span>
                    <span className="macro-box-lbl">Carb</span>
                  </div>
                  <div className="macro-box">
                    <span className="macro-box-val" style={{ color: '#f59e0b' }}>
                      {normNutrition?.fat !== undefined ? `${normNutrition.fat}g` : '—'}
                    </span>
                    <span className="macro-box-lbl">Béo</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredIngredients.length === 0 && (
          <div className="empty-results">
            <FiInfo size={32} style={{ color: '#94a3b8', marginBottom: 8 }} />
            <h3>Không tìm thấy nguyên liệu nào</h3>
            <p>Vui lòng thử từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
          </div>
        )}
      </div>

      {/* Detailed Modal view */}
      {activeIngredient && (
        <div className="ingredient-modal-overlay" onClick={closeDetailModal}>
          <div className="ingredient-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Image Header with Close button & Gradient Name Overlay */}
            <div className="ingredient-modal-header">
              <img 
                src={resolveIngredientImageUrl(activeIngredient.imageUrl, activeIngredient.name)} 
                alt={activeIngredient.name}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&h=150&auto=format&fit=crop';
                }}
              />
              <button className="ingredient-modal-close-btn" onClick={closeDetailModal} title="Đóng">
                <FiX size={20} />
              </button>
              
              <div className="ingredient-modal-header-info">
                <h2>{activeIngredient.name}</h2>
                <div className="ingredient-modal-badges">
                  {(activeIngredient.ingredientLabels || []).map((l, idx) => (
                    <span key={l.label_id || idx} className="modal-badge">
                      {l.labelName}
                    </span>
                  ))}
                  <span className="modal-badge" style={{ background: '#22c55e' }}>
                    Giá: ~${activeIngredient.averagePrice?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="ingredient-modal-body">
              {/* Modal Quantity Slider */}
              <div className="modal-qty-controller">
                <span className="modal-qty-lbl">
                  Tính toán cho:{' '}
                  <span>
                    {viewMode === 'hundred' ? (
                      `${modalVal} g`
                    ) : (
                      `${modalUnitInfo?.displayLabel}`
                    )}
                  </span>
                </span>
                
                <div className="calculator-inputs" style={{ margin: 0 }}>
                  {viewMode === 'hundred' ? (
                    <>
                      <div className="weight-slider-wrapper" style={{ minWidth: '150px' }}>
                        <input
                          type="range"
                          min="10"
                          max="1000"
                          step="10"
                          value={modalVal}
                          onChange={(e) => handleModalValChange(e.target.value)}
                        />
                      </div>
                      <div className="weight-input-wrapper">
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          value={modalVal}
                          onChange={(e) => handleModalValChange(e.target.value)}
                        />
                        <span className="weight-unit-label">g</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="weight-slider-wrapper" style={{ minWidth: '150px' }}>
                        <input
                          type="range"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={modalVal}
                          onChange={(e) => handleModalValChange(e.target.value)}
                        />
                      </div>
                      <div className="weight-input-wrapper">
                        <input
                          type="number"
                          min="0.1"
                          max="50"
                          step="0.1"
                          value={modalVal}
                          onChange={(e) => handleModalValChange(e.target.value)}
                        />
                        <span className="weight-unit-label">lần</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Nutrition Grid with Progress Bars */}
              <div className="nutrition-details-grid">
                {/* Calories */}
                <div className="nutrient-detail-item">
                  <span className="nutrient-lbl">Năng lượng</span>
                  <span className="nutrient-val" style={{ color: '#b45309' }}>
                    {modalNutrition?.calories} <span>kcal</span>
                  </span>
                  <div className="nutrient-progress-bar-bg">
                    <div 
                      className="nutrient-progress-bar-fill" 
                      style={{ 
                        width: `${Math.min((modalNutrition?.calories / DAILY_TARGETS.calories) * 100, 100)}%`, 
                        backgroundColor: '#f59e0b' 
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                    {Math.round((modalNutrition?.calories / DAILY_TARGETS.calories) * 100)}% nhu cầu hàng ngày ({DAILY_TARGETS.calories} kcal)
                  </span>
                </div>

                {/* Protein */}
                <div className="nutrient-detail-item">
                  <span className="nutrient-lbl">Chất đạm (Protein)</span>
                  <span className="nutrient-val">
                    {modalNutrition?.protein} <span>g</span>
                  </span>
                  <div className="nutrient-progress-bar-bg">
                    <div 
                      className="nutrient-progress-bar-fill protein-bar" 
                      style={{ width: `${Math.min((modalNutrition?.protein / DAILY_TARGETS.protein) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                    {Math.round((modalNutrition?.protein / DAILY_TARGETS.protein) * 100)}% nhu cầu hàng ngày ({DAILY_TARGETS.protein}g)
                  </span>
                </div>

                {/* Carbs */}
                <div className="nutrient-detail-item">
                  <span className="nutrient-lbl">Tinh bột (Carbohydrates)</span>
                  <span className="nutrient-val">
                    {modalNutrition?.carbs} <span>g</span>
                  </span>
                  <div className="nutrient-progress-bar-bg">
                    <div 
                      className="nutrient-progress-bar-fill carbs-bar" 
                      style={{ width: `${Math.min((modalNutrition?.carbs / DAILY_TARGETS.carbs) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                    {Math.round((modalNutrition?.carbs / DAILY_TARGETS.carbs) * 100)}% nhu cầu hàng ngày ({DAILY_TARGETS.carbs}g)
                  </span>
                </div>

                {/* Fat */}
                <div className="nutrient-detail-item">
                  <span className="nutrient-lbl">Chất béo (Fat)</span>
                  <span className="nutrient-val">
                    {modalNutrition?.fat} <span>g</span>
                  </span>
                  <div className="nutrient-progress-bar-bg">
                    <div 
                      className="nutrient-progress-bar-fill fat-bar" 
                      style={{ width: `${Math.min((modalNutrition?.fat / DAILY_TARGETS.fat) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                    {Math.round((modalNutrition?.fat / DAILY_TARGETS.fat) * 100)}% nhu cầu hàng ngày ({DAILY_TARGETS.fat}g)
                  </span>
                </div>

                {/* Fiber */}
                <div className="nutrient-detail-item">
                  <span className="nutrient-lbl">Chất xơ (Fiber)</span>
                  <span className="nutrient-val">
                    {modalNutrition?.fiber} <span>g</span>
                  </span>
                  <div className="nutrient-progress-bar-bg">
                    <div 
                      className="nutrient-progress-bar-fill fiber-bar" 
                      style={{ width: `${Math.min((modalNutrition?.fiber / DAILY_TARGETS.fiber) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                    {Math.round((modalNutrition?.fiber / DAILY_TARGETS.fiber) * 100)}% nhu cầu hàng ngày ({DAILY_TARGETS.fiber}g)
                  </span>
                </div>

                {/* Sugar */}
                <div className="nutrient-detail-item">
                  <span className="nutrient-lbl">Đường (Sugar)</span>
                  <span className="nutrient-val">
                    {modalNutrition?.sugar} <span>g</span>
                  </span>
                  <div className="nutrient-progress-bar-bg">
                    <div 
                      className="nutrient-progress-bar-fill sugar-bar" 
                      style={{ width: `${Math.min((modalNutrition?.sugar / DAILY_TARGETS.sugar) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                    Giới hạn khuyến nghị: &lt;{DAILY_TARGETS.sugar}g / ngày
                  </span>
                </div>

                {/* Salt */}
                <div className="nutrient-detail-item">
                  <span className="nutrient-lbl">Muối (Salt)</span>
                  <span className="nutrient-val">
                    {modalNutrition?.salt} <span>g</span>
                  </span>
                  <div className="nutrient-progress-bar-bg">
                    <div 
                      className="nutrient-progress-bar-fill salt-bar" 
                      style={{ width: `${Math.min((modalNutrition?.salt / DAILY_TARGETS.salt) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                    Giới hạn khuyến nghị: &lt;{DAILY_TARGETS.salt}g / ngày
                  </span>
                </div>

                {/* Cholesterol */}
                <div className="nutrient-detail-item">
                  <span className="nutrient-lbl">Cholesterol</span>
                  <span className="nutrient-val">
                    {modalNutrition?.cholesterol} <span>mg</span>
                  </span>
                  <div className="nutrient-progress-bar-bg">
                    <div 
                      className="nutrient-progress-bar-fill cholesterol-bar" 
                      style={{ width: `${Math.min((modalNutrition?.cholesterol / DAILY_TARGETS.cholesterol) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                    Giới hạn khuyến nghị: &lt;{DAILY_TARGETS.cholesterol}mg / ngày
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
