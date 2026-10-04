import React, { useState, useEffect, useRef } from 'react';
import {
  FiX, FiInfo, FiShoppingBag, FiList, FiPlus, FiTrash2,
  FiArrowUp, FiArrowDown, FiSearch, FiCheck, FiStar,
  FiGrid, FiFileText, FiClock, FiUsers, FiAward, FiArrowLeft
} from 'react-icons/fi';
import ImageUpload from '../common/ImageUpload';
import './RecipeEditorModal.css';

const COMMON_UOMS = [
  'g',
  'kg',
  'ml',
  'l',
  'quả',
  'trái',
  'củ',
  'tép',
  'nhánh',
  'muỗng canh (tbsp)',
  'muỗng cà phê (tsp)',
  'chén',
  'bát',
  'lát',
  'miếng',
  'gói',
  'hộp',
  'bó',
  'khác...'
];

// Helper to parse existing raw instruction into structured steps
export const parseInstructionToSteps = (rawInstruction) => {
  if (!rawInstruction || typeof rawInstruction !== 'string' || !rawInstruction.trim()) {
    return [{ id: 'step-1', title: '', text: '' }];
  }

  const lines = rawInstruction.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return [{ id: 'step-1', title: '', text: '' }];
  }

  return lines.map((line, idx) => {
    // Strip "1. ", "Bước 1: ", "Step 1: ", "1) ", etc.
    let text = line.replace(/^(\d+[\.\:\)\-]|bước\s*\d+[\.\:\)\-]|step\s*\d+[\.\:\)\-])\s*/i, '').trim();
    
    // Check if there's an optional bracketed title: e.g. "[Sơ chế] Rửa sạch..."
    let title = '';
    const titleMatch = text.match(/^\[(.*?)\]\s*(.*)$/);
    if (titleMatch) {
      title = titleMatch[1];
      text = titleMatch[2];
    }

    return {
      id: `step-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      text: text || line
    };
  });
};

// Helper to serialize steps back into unified instruction format
export const serializeStepsToInstruction = (steps) => {
  return steps
    .filter(s => s.text && s.text.trim())
    .map((s, idx) => {
      const titlePrefix = s.title && s.title.trim() ? `[${s.title.trim()}] ` : '';
      return `${idx + 1}. ${titlePrefix}${s.text.trim()}`;
    })
    .join('\n');
};

export default function RecipeEditorModal({
  isOpen,
  onClose,
  onSave,
  initialRecipe = null,
  availableRecipeTags = [],
  availableIngredients = [],
  currentIngredients = [],
  saving = false
}) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'ingredients' | 'instructions'
  
  // Basic Recipe Info Form
  const [formData, setFormData] = useState({
    recipe_name: '',
    imageUrl: '',
    description: '',
    cookTime: 15,
    prepTime: 10,
    servings: 2,
    difficulty: 'easy',
    isPublic: true,
    recipeTagIds: [],
    account_id: ''
  });

  // Structured Steps
  const [steps, setSteps] = useState([{ id: 'step-1', title: '', text: '' }]);
  const [showQuickImport, setShowQuickImport] = useState(false);
  const [quickImportText, setQuickImportText] = useState('');

  // Structured Recipe Ingredients
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  
  // Ingredient search & browse state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySelectedTag, setLibrarySelectedTag] = useState('all');
  const [librarySearch, setLibrarySearch] = useState('');
  const searchBoxRef = useRef(null);

  // Initialize or reset form when modal opens or initialRecipe changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialRecipe) {
      // Edit mode
      const tagIds = (initialRecipe.recipeLabels || []).map(label => {
        const tag = availableRecipeTags.find(t => t.name === label.labelName);
        return tag ? (tag.id || tag.rt_Id) : null;
      }).filter(Boolean);

      setFormData({
        recipe_name: initialRecipe.recipe_name || '',
        imageUrl: initialRecipe.imageUrl || '',
        description: initialRecipe.description || '',
        cookTime: initialRecipe.cookTime || 0,
        prepTime: initialRecipe.prepTime || 0,
        servings: initialRecipe.servings || 1,
        difficulty: initialRecipe.difficulty || 'easy',
        isPublic: initialRecipe.isPublic !== undefined ? initialRecipe.isPublic : true,
        recipeTagIds: tagIds,
        account_id: initialRecipe.account_id || initialRecipe.Account_id || ''
      });

      // Parse instructions to step array
      setSteps(parseInstructionToSteps(initialRecipe.instruction || ''));

      // Map ingredients
      const mapped = currentIngredients.map(ci => {
        const ingDetails = availableIngredients.find(
          ai => (ai.ingredient_id || ai.id) === (ci.ingredient_id || ci.Ingredient_id)
        );
        return {
          id: ci.id || ci.ri_id || `temp-${Math.random()}`,
          ingredient_id: ci.ingredient_id || ci.Ingredient_id,
          name: ingDetails?.name || ingDetails?.Name || ci.name || 'Nguyên liệu',
          quantity: ci.quantity || ci.Quantity || 1,
          uom: ci.uom || ci.UOM || 'g',
          isPrimary: !!(ci.isPrimary || ci.IsPrimary),
          nutritionalValue: ingDetails?.nutritional_value || ingDetails?.Nutritional_value,
          ingredientLabels: ingDetails?.ingredientLabels || []
        };
      });
      setSelectedIngredients(mapped);
    } else {
      // Create new mode
      setFormData({
        recipe_name: '',
        imageUrl: '',
        description: '',
        cookTime: 15,
        prepTime: 10,
        servings: 2,
        difficulty: 'easy',
        isPublic: true,
        recipeTagIds: [],
        account_id: ''
      });
      setSteps([
        { id: 'step-1', title: 'Sơ chế', text: '' },
        { id: 'step-2', title: 'Chế biến', text: '' }
      ]);
      setSelectedIngredients([]);
    }

    setActiveTab('info');
    setShowQuickImport(false);
    setSearchQuery('');
  }, [isOpen, initialRecipe, currentIngredients, availableIngredients, availableRecipeTags]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Escape handler: Close library if open, or close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isLibraryOpen) {
          setIsLibraryOpen(false);
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLibraryOpen, onClose]);

  if (!isOpen) return null;

  // ----------------------------------------------------
  // Step Actions
  // ----------------------------------------------------
  const handleAddStep = () => {
    setSteps(prev => [
      ...prev,
      { id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, title: '', text: '' }
    ]);
  };

  const handleUpdateStep = (index, field, value) => {
    setSteps(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveStep = (index) => {
    if (steps.length <= 1) {
      setSteps([{ id: 'step-1', title: '', text: '' }]);
      return;
    }
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveStep = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    setSteps(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleQuickImportSteps = () => {
    if (!quickImportText.trim()) return;
    const parsed = parseInstructionToSteps(quickImportText);
    setSteps(parsed);
    setQuickImportText('');
    setShowQuickImport(false);
  };

  // ----------------------------------------------------
  // Ingredient Actions
  // ----------------------------------------------------
  const handleSelectIngredient = (ingredient) => {
    const ingId = ingredient.ingredient_id || ingredient.id;
    // Check if already selected
    const existingIndex = selectedIngredients.findIndex(si => si.ingredient_id === ingId);
    if (existingIndex >= 0) {
      // Focus or alert
      setIsSearchDropdownOpen(false);
      setSearchQuery('');
      return;
    }

    // Determine default UOM
    const defaultUOM = ingredient.nutritional_value?.everydayUnit ||
      ingredient.nutritional_value?.servingUnit ||
      'g';

    const newIng = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ingredient_id: ingId,
      name: ingredient.name || ingredient.Name,
      quantity: ingredient.nutritional_value?.everydayWeight || 100,
      uom: defaultUOM,
      isPrimary: false,
      nutritionalValue: ingredient.nutritional_value || ingredient.Nutritional_value,
      ingredientLabels: ingredient.ingredientLabels || []
    };

    setSelectedIngredients(prev => [...prev, newIng]);
    setSearchQuery('');
    setIsSearchDropdownOpen(false);
  };

  const handleUpdateIngredient = (index, field, value) => {
    setSelectedIngredients(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Filter available ingredients for search autocomplete
  const filteredSearchIngredients = searchQuery.trim()
    ? availableIngredients.filter(ing => {
        const name = (ing.name || ing.Name || '').toLowerCase();
        const tags = (ing.ingredientLabels || []).map(l => (l.labelName || l.LabelName || '').toLowerCase()).join(' ');
        const q = searchQuery.toLowerCase();
        return name.includes(q) || tags.includes(q);
      }).slice(0, 10)
    : [];

  // Library modal tags & list
  const allLibraryTags = Array.from(new Set(
    availableIngredients.flatMap(i => (i.ingredientLabels || []).map(l => l.labelName || l.LabelName)).filter(Boolean)
  ));

  const filteredLibraryIngredients = availableIngredients.filter(ing => {
    const matchesSearch = !librarySearch.trim() ||
      (ing.name || ing.Name || '').toLowerCase().includes(librarySearch.toLowerCase());
    const matchesTag = librarySelectedTag === 'all' ||
      (ing.ingredientLabels || []).some(l => (l.labelName || l.LabelName) === librarySelectedTag);
    return matchesSearch && matchesTag;
  });

  // Calculate estimated total calories
  const totalCaloriesEstimate = selectedIngredients.reduce((sum, item) => {
    const nv = item.nutritionalValue;
    if (!nv || !nv.calories) return sum;
    const servingSize = nv.servingSize || 100;
    const qty = parseFloat(item.quantity) || 0;
    const cal = (nv.calories * qty) / servingSize;
    return sum + (isNaN(cal) ? 0 : cal);
  }, 0);

  // ----------------------------------------------------
  // Submit Handler
  // ----------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.recipe_name.trim()) {
      alert('Vui lòng nhập tên công thức / món ăn');
      setActiveTab('info');
      return;
    }

    const validSteps = steps.filter(s => s.text && s.text.trim());
    if (validSteps.length === 0) {
      alert('Vui lòng thêm ít nhất 1 bước hướng dẫn nấu ăn');
      setActiveTab('instructions');
      return;
    }

    if (selectedIngredients.length === 0) {
      alert('Vui lòng thêm ít nhất 1 nguyên liệu cho món ăn');
      setActiveTab('ingredients');
      return;
    }

    const instructionSerialized = serializeStepsToInstruction(validSteps);

    const baseRecipeData = {
      ...formData,
      recipe_name: formData.recipe_name.trim(),
      description: formData.description.trim(),
      instruction: instructionSerialized,
      cookTime: parseInt(formData.cookTime) || 0,
      prepTime: parseInt(formData.prepTime) || 0,
      servings: parseInt(formData.servings) || 1,
      difficulty: formData.difficulty,
      isPublic: !!formData.isPublic,
      recipeTagIds: formData.recipeTagIds
    };

    const ingredientsPayload = selectedIngredients.map(ing => ({
      ingredient_id: ing.ingredient_id,
      quantity: Math.round(parseFloat(ing.quantity)) || 1,
      uom: ing.uom || 'g',
      isPrimary: !!ing.isPrimary
    }));

    onSave({ baseRecipeData, ingredients: ingredientsPayload });
  };

  return (
    <div className="recipe-editor-overlay">
      <div className="recipe-editor-modal">
        {/* Header */}
        <div className="recipe-editor-header">
          <div className="recipe-editor-title-wrap">
            <h3>{initialRecipe ? 'Chỉnh sửa công thức' : 'Thêm công thức mới'}</h3>
            <p className="recipe-editor-subtitle">
              {formData.recipe_name ? `Món ăn: ${formData.recipe_name}` : 'Chuẩn hóa quy trình tạo công thức & món ăn'}
            </p>
          </div>
          <button type="button" className="btn-close-editor" onClick={onClose} title="Đóng">
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="recipe-editor-tabs">
          <button
            type="button"
            className={`recipe-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FiInfo size={16} />
            <span>Thông tin cơ bản</span>
          </button>

          <button
            type="button"
            className={`recipe-tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            <FiShoppingBag size={16} />
            <span>Nguyên liệu</span>
            {selectedIngredients.length > 0 && (
              <span className="tab-badge">{selectedIngredients.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`recipe-tab-btn ${activeTab === 'instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            <FiList size={16} />
            <span>Các bước nấu</span>
            {steps.filter(s => s.text.trim()).length > 0 && (
              <span className="tab-badge">{steps.filter(s => s.text.trim()).length}</span>
            )}
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="recipe-editor-body">
          {/* ================= TAB 1: BASIC INFO ================= */}
          {activeTab === 'info' && (
            <div className="recipe-tab-pane">
              <div className="grid-cols-2">
                <div>
                  <div className="form-group-custom">
                    <label>Tên món ăn / công thức <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      placeholder="VD: Salad ức gà rau củ sốt mè rang"
                      value={formData.recipe_name}
                      onChange={(e) => setFormData({ ...formData, recipe_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Mô tả ngắn</label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả hấp dẫn về hương vị, dinh dưỡng và điểm đặc biệt của món ăn..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid-cols-3">
                    <div className="form-group-custom">
                      <label><FiClock size={13} style={{ marginRight: 4 }} /> Chuẩn bị (phút)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group-custom">
                      <label><FiClock size={13} style={{ marginRight: 4 }} /> Nấu (phút)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.cookTime}
                        onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group-custom">
                      <label><FiUsers size={13} style={{ marginRight: 4 }} /> Khẩu phần</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="grid-cols-2">
                    <div className="form-group-custom">
                      <label><FiAward size={13} style={{ marginRight: 4 }} /> Độ khó</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      >
                        <option value="easy">Dễ (Easy)</option>
                        <option value="medium">Trung bình (Medium)</option>
                        <option value="hard">Khó (Hard)</option>
                      </select>
                    </div>

                    <div className="form-group-custom">
                      <label>Chế độ hiển thị</label>
                      <select
                        value={formData.isPublic ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === 'true' })}
                      >
                        <option value="true">Công khai (Public)</option>
                        <option value="false">Riêng tư (Private)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="form-group-custom">
                    <label>Hình ảnh món ăn</label>
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                      label="Tải ảnh bìa công thức"
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>
                      Thẻ phân loại món ăn (Recipe Tags)
                      {formData.recipeTagIds.length > 0 && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: '#10b981', fontWeight: 'bold' }}>
                          ({formData.recipeTagIds.length} thẻ đã chọn)
                        </span>
                      )}
                    </label>
                    <div className="tag-chips-container">
                      {availableRecipeTags.map((tag) => {
                        const tagId = tag.id || tag.rt_Id;
                        const isSelected = formData.recipeTagIds.includes(tagId);
                        return (
                          <div
                            key={tagId}
                            className={`tag-chip-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                setFormData({
                                  ...formData,
                                  recipeTagIds: formData.recipeTagIds.filter(id => id !== tagId)
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  recipeTagIds: [...formData.recipeTagIds, tagId]
                                });
                              }
                            }}
                          >
                            {isSelected && <FiCheck size={12} />}
                            <span>{tag.name}</span>
                          </div>
                        );
                      })}
                      {availableRecipeTags.length === 0 && (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Chưa có thẻ công thức nào</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: INGREDIENTS ================= */}
          {activeTab === 'ingredients' && (
            <div className="recipe-tab-pane">
              {/* Search Toolbar */}
              <div className="ingredients-toolbar">
                <div className="ingredient-search-box" ref={searchBoxRef}>
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    className="ingredient-search-input"
                    placeholder="Gõ tìm kiếm nguyên liệu để thêm nhanh (VD: thịt bò, trứng, hành, sữa chua...)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (searchQuery.trim()) setIsSearchDropdownOpen(true);
                    }}
                  />

                  {/* Autocomplete Dropdown */}
                  {isSearchDropdownOpen && searchQuery.trim() && (
                    <div className="ingredient-dropdown-results">
                      {filteredSearchIngredients.length === 0 ? (
                        <div style={{ padding: '12px', fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                          Không tìm thấy nguyên liệu phù hợp với "{searchQuery}"
                        </div>
                      ) : (
                        filteredSearchIngredients.map(ing => {
                          const ingId = ing.ingredient_id || ing.id;
                          const isAdded = selectedIngredients.some(si => si.ingredient_id === ingId);
                          return (
                            <div
                              key={ingId}
                              className={`ingredient-dropdown-item ${isAdded ? 'already-added' : ''}`}
                              onClick={() => handleSelectIngredient(ing)}
                            >
                              <div className="dropdown-item-info">
                                <span className="dropdown-item-name">{ing.name || ing.Name}</span>
                                <div className="dropdown-item-meta">
                                  {(ing.ingredientLabels || []).slice(0, 2).map((l, i) => (
                                    <span key={i} className="dropdown-tag">{l.labelName || l.LabelName}</span>
                                  ))}
                                  {ing.nutritional_value?.calories && (
                                    <span>~{Math.round(ing.nutritional_value.calories)} kcal / 100g</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                {isAdded ? (
                                  <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✓ Đã thêm</span>
                                ) : (
                                  <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>+ Thêm</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-browse-ingredients"
                  onClick={() => setIsLibraryOpen(true)}
                >
                  <FiGrid size={16} />
                  <span>Duyệt thư viện ({availableIngredients.length})</span>
                </button>
              </div>

              {/* Summary Bar */}
              <div className="ingredients-summary-bar">
                <span>Danh sách nguyên liệu ({selectedIngredients.length})</span>
                {totalCaloriesEstimate > 0 && (
                  <span style={{ color: '#059669' }}>
                    Ước tính calo: ~{Math.round(totalCaloriesEstimate)} kcal cho toàn bộ công thức
                  </span>
                )}
              </div>

              {/* Selected Ingredients List */}
              <div className="ingredients-list-container">
                {selectedIngredients.length === 0 ? (
                  <div className="empty-ingredients-box">
                    <FiShoppingBag size={36} style={{ color: '#cbd5e1' }} />
                    <p>Chưa có nguyên liệu nào được thêm vào công thức này.</p>
                    <button
                      type="button"
                      className="btn-browse-ingredients"
                      onClick={() => setIsLibraryOpen(true)}
                    >
                      <FiPlus size={16} /> Chọn từ thư viện nguyên liệu
                    </button>
                  </div>
                ) : (
                  selectedIngredients.map((item, index) => {
                    const nv = item.nutritionalValue;
                    const servingSize = nv?.servingSize || 100;
                    const qty = parseFloat(item.quantity) || 0;
                    const itemCal = nv?.calories ? Math.round((nv.calories * qty) / servingSize) : null;

                    return (
                      <div
                        key={item.id || index}
                        className={`ingredient-card-row ${item.isPrimary ? 'ing-primary-row' : ''}`}
                      >
                        {/* Name & Tag */}
                        <div className="ing-col-name">
                          <span className="ing-title">{item.name}</span>
                          <span className="ing-category-label">
                            {(item.ingredientLabels || []).map(l => l.labelName || l.LabelName).slice(0, 2).join(' • ') || 'Nguyên liệu'}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="ing-col-qty">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleUpdateIngredient(index, 'quantity', e.target.value)}
                            title="Số lượng"
                            placeholder="Số lượng"
                            required
                          />
                        </div>

                        {/* UOM */}
                        <div className="ing-col-uom">
                          <select
                            value={item.uom}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'khác...') {
                                const custom = prompt('Nhập đơn vị tính tuỳ chỉnh (VD: củ, trái, miếng, chén...):');
                                if (custom && custom.trim()) {
                                  handleUpdateIngredient(index, 'uom', custom.trim());
                                }
                              } else {
                                handleUpdateIngredient(index, 'uom', val);
                              }
                            }}
                          >
                            {!COMMON_UOMS.includes(item.uom) && (
                              <option value={item.uom}>{item.uom}</option>
                            )}
                            {COMMON_UOMS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>

                        {/* Primary Toggle */}
                        <div>
                          <button
                            type="button"
                            className={`btn-primary-toggle ${item.isPrimary ? 'active' : ''}`}
                            onClick={() => handleUpdateIngredient(index, 'isPrimary', !item.isPrimary)}
                            title="Đánh dấu là nguyên liệu chính của món"
                          >
                            <FiStar size={12} fill={item.isPrimary ? '#ffffff' : 'none'} />
                            <span>{item.isPrimary ? 'Chính' : 'Phụ'}</span>
                          </button>
                        </div>

                        {/* Calories estimate */}
                        <div className="ing-calories-badge">
                          {itemCal !== null ? `~${itemCal} kcal` : '-'}
                        </div>

                        {/* Delete Row */}
                        <div>
                          <button
                            type="button"
                            className="btn-delete-row"
                            onClick={() => handleRemoveIngredient(index)}
                            title="Xóa nguyên liệu này"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: STEP-BY-STEP INSTRUCTIONS ================= */}
          {activeTab === 'instructions' && (
            <div className="recipe-tab-pane">
              <div className="instructions-header-bar">
                <div className="instructions-info">
                  <h4>Chuẩn hóa từng bước thực hiện</h4>
                  <p>Mỗi bước nên diễn đạt rõ ràng thao tác, nhiệt độ hoặc thời gian để người nấu dễ làm theo.</p>
                </div>
                <div className="instructions-actions">
                  <button
                    type="button"
                    className="btn-quick-import"
                    onClick={() => setShowQuickImport(!showQuickImport)}
                  >
                    <FiFileText size={15} />
                    <span>{showQuickImport ? 'Đóng công cụ tách chữ' : 'Nhập nhanh từ văn bản'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Text Import Panel */}
              {showQuickImport && (
                <div className="quick-import-panel">
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    Dán nội dung hướng dẫn nấu ăn vào đây (mỗi dòng hoặc số thứ tự 1., 2., Bước 1... sẽ tự động được tách thành 1 bước riêng):
                  </span>
                  <textarea
                    rows={4}
                    value={quickImportText}
                    onChange={(e) => setQuickImportText(e.target.value)}
                    placeholder="VD:&#10;1. Sơ chế thịt gà và rửa sạch với muối&#10;2. Ướp thịt gà với sốt và để trong 15 phút&#10;3. Nướng gà ở 180 độ C trong 20 phút"
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-cancel-editor"
                      style={{ padding: '6px 14px', fontSize: 13 }}
                      onClick={() => setShowQuickImport(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="btn-save-recipe"
                      style={{ padding: '6px 16px', fontSize: 13 }}
                      onClick={handleQuickImportSteps}
                    >
                      Tự động phân tách thành các bước
                    </button>
                  </div>
                </div>
              )}

              {/* Step Cards List */}
              <div className="steps-container">
                {steps.map((step, index) => (
                  <div key={step.id || index} className="step-card">
                    {/* Step Number Circle */}
                    <div className="step-badge-col">
                      <div className="step-number-circle">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content Inputs */}
                    <div className="step-content-col">
                      <input
                        type="text"
                        className="step-title-input"
                        placeholder="Tiêu đề bước (không bắt buộc, VD: Sơ chế rau củ, Xào chín, Thưởng thức...)"
                        value={step.title || ''}
                        onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                      />
                      <textarea
                        className="step-text-input"
                        rows={2}
                        placeholder={`Mô tả chi tiết bước ${index + 1}: chuẩn bị nguyên liệu gì, thực hiện thao tác ra sao...`}
                        value={step.text}
                        onChange={(e) => handleUpdateStep(index, 'text', e.target.value)}
                        required
                      />
                    </div>

                    {/* Step Controls */}
                    <div className="step-actions-col">
                      <button
                        type="button"
                        className="btn-step-action"
                        onClick={() => handleMoveStep(index, -1)}
                        disabled={index === 0}
                        title="Di chuyển lên trên"
                      >
                        <FiArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-step-action"
                        onClick={() => handleMoveStep(index, 1)}
                        disabled={index === steps.length - 1}
                        title="Di chuyển xuống dưới"
                      >
                        <FiArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-step-action btn-step-delete"
                        onClick={() => handleRemoveStep(index)}
                        title="Xóa bước này"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Step Button */}
              <button
                type="button"
                className="btn-add-step"
                onClick={handleAddStep}
              >
                <FiPlus size={18} />
                <span>Thêm bước tiếp theo (Bước {steps.length + 1})</span>
              </button>
            </div>
          )}

          {/* Hidden submit trigger button for form */}
          <button id="recipe-submit-btn" type="submit" style={{ display: 'none' }} />
        </form>

        {/* Footer Actions */}
        <div className="recipe-editor-footer">
          <div className="editor-footer-summary">
            <span className="summary-pill">{selectedIngredients.length} nguyên liệu</span>
            <span className="summary-pill">{steps.filter(s => s.text.trim()).length} bước thực hiện</span>
          </div>

          <div className="editor-footer-buttons">
            <button
              type="button"
              className="btn-cancel-editor"
              onClick={onClose}
              disabled={saving}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn-save-recipe"
              onClick={() => {
                document.getElementById('recipe-submit-btn')?.click();
              }}
              disabled={saving}
            >
              {saving ? 'Đang lưu công thức...' : initialRecipe ? 'Cập nhật công thức' : 'Tạo mới công thức'}
            </button>
          </div>
        </div>

        {/* ================= LIBRARY DRAWER / MODAL ================= */}
        {isLibraryOpen && (
          <div className="ingredient-library-modal">
            <div className="lib-header">
              <div className="lib-header-left">
                <button
                  type="button"
                  className="btn-back-library"
                  onClick={() => setIsLibraryOpen(false)}
                  title="Quay lại tạo món"
                >
                  <FiArrowLeft size={16} />
                  <span>Quay lại</span>
                </button>
                <h4>Thư viện nguyên liệu ({availableIngredients.length})</h4>
              </div>
              <button
                type="button"
                className="btn-close-editor"
                onClick={() => setIsLibraryOpen(false)}
                title="Đóng thư viện"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="lib-toolbar">
              <div className="ingredient-search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  className="ingredient-search-input"
                  placeholder="Lọc theo tên nguyên liệu..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                />
              </div>

              <div className="lib-tag-filters">
                <button
                  type="button"
                  className={`lib-tag-btn ${librarySelectedTag === 'all' ? 'active' : ''}`}
                  onClick={() => setLibrarySelectedTag('all')}
                >
                  Tất cả ({availableIngredients.length})
                </button>
                {allLibraryTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`lib-tag-btn ${librarySelectedTag === tag ? 'active' : ''}`}
                    onClick={() => setLibrarySelectedTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="lib-content-grid">
              {filteredLibraryIngredients.map(ing => {
                const ingId = ing.ingredient_id || ing.id;
                const isSelected = selectedIngredients.some(si => si.ingredient_id === ingId);
                return (
                  <div
                    key={ingId}
                    className={`lib-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedIngredients(prev => prev.filter(si => si.ingredient_id !== ingId));
                      } else {
                        handleSelectIngredient(ing);
                      }
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>{ing.name || ing.Name}</strong>
                        {isSelected && <FiCheck size={16} color="#10b981" />}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        {(ing.ingredientLabels || []).map(l => l.labelName || l.LabelName).slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                      {ing.nutritional_value?.calories ? `~${Math.round(ing.nutritional_value.calories)} kcal/100g` : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lib-footer">
              <div className="lib-footer-info">
                <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  {selectedIngredients.length > 0
                    ? `Đã chọn ${selectedIngredients.length} nguyên liệu cho món ăn`
                    : 'Chưa chọn nguyên liệu nào'}
                </span>
              </div>
              <div className="lib-footer-buttons">
                <button
                  type="button"
                  className="btn-cancel-library"
                  onClick={() => setIsLibraryOpen(false)}
                >
                  Quay lại tạo món
                </button>
                <button
                  type="button"
                  className="btn-done-library"
                  onClick={() => setIsLibraryOpen(false)}
                >
                  <FiCheck size={16} />
                  <span>Xong (Xem lại nguyên liệu)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
