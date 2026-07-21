import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiZap, FiTarget } from 'react-icons/fi';
import { MdLocalFireDepartment, MdRestaurantMenu } from 'react-icons/md';
import './CalorieSuggester.css';

const MEAL_PRESETS = [
  { key: 'breakfast', label: 'Bữa sáng', calories: 350, icon: '🌅' },
  { key: 'lunch', label: 'Bữa trưa', calories: 550, icon: '☀️' },
  { key: 'dinner', label: 'Bữa tối', calories: 550, icon: '🌙' },
  { key: 'snack', label: 'Bữa phụ', calories: 175, icon: '🍪' },
];

export default function CalorieSuggester({
  dailyBudget = 2000,
  todayCalories = 0,
  onTargetChange,
  currentTarget,
  totalRecipes = 0,
  matchedRecipes = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [customCalories, setCustomCalories] = useState('');
  const [activePreset, setActivePreset] = useState(null);
  const [useRemaining, setUseRemaining] = useState(false);

  const remainingCalories = Math.max(0, dailyBudget - todayCalories);
  const remainingPercent = dailyBudget > 0 ? Math.round((remainingCalories / dailyBudget) * 100) : 0;
  const consumedPercent = dailyBudget > 0 ? Math.round((todayCalories / dailyBudget) * 100) : 0;

  const handlePresetClick = (preset) => {
    if (activePreset === preset.key) {
      setActivePreset(null);
      setUseRemaining(false);
      setCustomCalories('');
      onTargetChange(null);
      return;
    }
    setActivePreset(preset.key);
    setUseRemaining(false);
    setCustomCalories('');
    onTargetChange(preset.calories);
  };

  const handleRemainingClick = () => {
    if (useRemaining) {
      setUseRemaining(false);
      setActivePreset(null);
      setCustomCalories('');
      onTargetChange(null);
      return;
    }
    setUseRemaining(true);
    setActivePreset(null);
    setCustomCalories('');
    onTargetChange(remainingCalories);
  };

  const handleCustomSubmit = (e) => {
    const val = parseInt(customCalories, 10);
    if (isNaN(val) || val <= 0) return;
    setActivePreset(null);
    setUseRemaining(false);
    onTargetChange(val);
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCustomSubmit();
    }
  };

  const handleClear = () => {
    setActivePreset(null);
    setUseRemaining(false);
    setCustomCalories('');
    onTargetChange(null);
  };

  const isActive = currentTarget !== null;

  return (
    <div className={`calorie-suggester ${isActive ? 'has-target' : ''}`}>
      <div className="cal-suggester-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="cal-suggester-title">
          <MdLocalFireDepartment className="cal-icon" />
          <span>Gợi ý món ăn theo Kcal</span>
          {isActive && (
            <span className="cal-active-badge">
              <FiZap size={12} /> {currentTarget} kcal
            </span>
          )}
        </div>
        <div className="cal-suggester-toggle">
          {isActive && (
            <span className="cal-match-count">
              {matchedRecipes}/{totalRecipes} món
            </span>
          )}
          {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div className="cal-suggester-body">
          <div className="cal-daily-summary">
            <div className="cal-daily-item">
              <span className="cal-daily-label">Ngân sách</span>
              <span className="cal-daily-value">{dailyBudget}</span>
              <span className="cal-daily-unit">kcal</span>
            </div>
            <div className="cal-daily-divider" />
            <div className="cal-daily-item">
              <span className="cal-daily-label">Đã dùng</span>
              <span className="cal-daily-value consumed">{Math.round(todayCalories)}</span>
              <span className="cal-daily-unit">kcal</span>
            </div>
            <div className="cal-daily-divider" />
            <div className="cal-daily-item">
              <span className="cal-daily-label">Còn lại</span>
              <span className="cal-daily-value remaining">{remainingCalories}</span>
              <span className="cal-daily-unit">kcal</span>
            </div>
          </div>

          <div className="cal-progress-bar">
            <div
              className="cal-progress-fill consumed"
              style={{ width: `${Math.min(consumedPercent, 100)}%` }}
            />
            {remainingPercent > 0 && (
              <div
                className="cal-progress-fill remaining"
                style={{ width: `${Math.min(remainingPercent, 100)}%`, left: `${Math.min(consumedPercent, 100)}%` }}
              />
            )}
          </div>

          <div className="cal-presets-section">
            <div className="cal-section-label">Chọn khẩu phần</div>
            <div className="cal-preset-buttons">
              {MEAL_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  className={`cal-preset-btn ${activePreset === preset.key ? 'active' : ''}`}
                  onClick={() => handlePresetClick(preset)}
                >
                  <span className="cal-preset-icon">{preset.icon}</span>
                  <span className="cal-preset-label">{preset.label}</span>
                  <span className="cal-preset-cals">~{preset.calories} kcal</span>
                </button>
              ))}
            </div>

            <div className="cal-custom-row">
              <button
                className={`cal-remaining-btn ${useRemaining ? 'active' : ''}`}
                onClick={handleRemainingClick}
                disabled={remainingCalories <= 0}
              >
                <FiTarget size={14} />
                Kcal còn lại ({remainingCalories})
              </button>

              <div className="cal-custom-input-group">
                <input
                  type="number"
                  className="cal-custom-input"
                  placeholder="Nhập kcal..."
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  onKeyDown={handleCustomKeyDown}
                  min={1}
                />
                <button
                  className="cal-custom-apply"
                  onClick={handleCustomSubmit}
                  disabled={!customCalories || parseInt(customCalories) <= 0}
                >
                  <MdRestaurantMenu size={14} />
                  Gợi ý
                </button>
              </div>
            </div>
          </div>

          {isActive && (
            <div className="cal-active-indicator">
              <button className="cal-clear-btn" onClick={handleClear}>
                Xoá bộ lọc kcal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
