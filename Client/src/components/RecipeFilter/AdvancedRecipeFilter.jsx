import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiFilter, FiRefreshCcw } from 'react-icons/fi';
import DualRangeSlider from '../common/DualRangeSlider/DualRangeSlider';
import './AdvancedRecipeFilter.css';

const AdvancedRecipeFilter = ({
  sortBy, setSortBy,
  timeRange, setTimeRange,
  difficultyFilter, setDifficultyFilter,
  caloriesRange, setCaloriesRange,
  minHealthScore, setMinHealthScore,
  onClose,
  totalResults
}) => {
  const popupRef = useRef(null);

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDifficultyToggle = (level) => {
    setDifficultyFilter(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleReset = () => {
    setSortBy('suitability');
    setTimeRange([0, 180]);
    setDifficultyFilter([]);
    setCaloriesRange([0, 1000]);
    setMinHealthScore(0);
  };

  const handleTimePreset = (min, max) => {
    setTimeRange([min, max]);
  };

  return (
    <div className="advanced-filter-overlay">
      <div className="advanced-filter-popup" ref={popupRef}>
        <div className="filter-header">
          <h3><FiFilter style={{ marginRight: 8 }} /> Bộ lọc & Sắp xếp</h3>
          <button className="close-btn" onClick={onClose}><FiX size={20} /></button>
        </div>

        <div className="filter-body">
          {/* Sort By */}
          <div className="filter-section">
            <h4 className="filter-title">Sắp xếp theo</h4>
            <div className="sort-options">
              {[
                { id: 'suitability', label: 'Phù hợp nhất' },
                { id: 'time', label: 'Nhanh nhất' },
                { id: 'difficulty', label: 'Dễ nhất' },
                { id: 'calories', label: 'Ít calo nhất' }
              ].map(opt => (
                <label key={opt.id} className="radio-label">
                  <input 
                    type="radio" 
                    name="sortBy" 
                    value={opt.id} 
                    checked={sortBy === opt.id}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Thời gian nấu</h4>
            <DualRangeSlider 
              min={0} max={180} step={5} 
              value={timeRange} 
              onChange={setTimeRange} 
              formatLabel={(val) => `${val} phút`}
              disableMaxCap={true}
            />
            <div className="preset-chips">
              <button 
                className={`preset-chip ${timeRange[0]===0 && timeRange[1]===180 ? 'active' : ''}`}
                onClick={() => handleTimePreset(0, 180)}
              >Tất cả</button>
              <button 
                className={`preset-chip ${timeRange[0]===0 && timeRange[1]===15 ? 'active' : ''}`}
                onClick={() => handleTimePreset(0, 15)}
              >≤15 phút</button>
              <button 
                className={`preset-chip ${timeRange[0]===15 && timeRange[1]===30 ? 'active' : ''}`}
                onClick={() => handleTimePreset(15, 30)}
              >15-30 phút</button>
              <button 
                className={`preset-chip ${timeRange[0]===30 && timeRange[1]===60 ? 'active' : ''}`}
                onClick={() => handleTimePreset(30, 60)}
              >30-60 phút</button>
              <button 
                className={`preset-chip ${timeRange[0]===60 && timeRange[1]===180 ? 'active' : ''}`}
                onClick={() => handleTimePreset(60, 180)}
              >&gt;60 phút</button>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Độ khó</h4>
            <div className="checkbox-options">
              {['Dễ', 'Trung bình', 'Khó'].map(level => (
                <label key={level} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={difficultyFilter.includes(level)}
                    onChange={() => handleDifficultyToggle(level)}
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Calories Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Calories</h4>
            <DualRangeSlider 
              min={0} max={1000} step={50} 
              value={caloriesRange} 
              onChange={setCaloriesRange} 
              formatLabel={(val) => `${val} kcal`}
              disableMaxCap={true}
            />
          </div>

          {/* Health Score Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Health Score</h4>
            <div className="sort-options">
              {[
                { id: 0, label: 'Tất cả' },
                { id: 60, label: 'Từ 60+ (Khá)' },
                { id: 80, label: 'Từ 80+ (Tốt)' },
                { id: 95, label: 'Từ 95+ (Rất tốt)' }
              ].map(opt => (
                <label key={opt.id} className="radio-label">
                  <input 
                    type="radio" 
                    name="healthScore" 
                    value={opt.id} 
                    checked={minHealthScore === opt.id}
                    onChange={() => setMinHealthScore(opt.id)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-footer">
          <div className="results-indicator">
            Tìm thấy <strong>{totalResults}</strong> công thức
          </div>
          <div className="footer-actions">
            <button className="reset-btn" onClick={handleReset}>
              <FiRefreshCcw size={14} style={{ marginRight: 6 }}/> Đặt lại
            </button>
            <button className="apply-btn" onClick={onClose}>Áp dụng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedRecipeFilter;
