import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DualRangeSlider.css';

const DualRangeSlider = ({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel,
  disableMaxCap = false
}) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = useCallback(
    (val) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    minValRef.current = value[0];
    maxValRef.current = value[1];
  }, [value]);

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(val);
    minValRef.current = val;
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(val);
    maxValRef.current = val;
    onChange([minVal, val]);
  };

  const displayMin = formatLabel ? formatLabel(minVal) : minVal;
  const displayMax = formatLabel 
    ? (disableMaxCap && maxVal === max ? `${formatLabel(max)}+` : formatLabel(maxVal))
    : (disableMaxCap && maxVal === max ? `${maxVal}+` : maxVal);

  return (
    <div className="dual-slider-container">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className="thumb thumb--left"
        style={{ zIndex: minVal > max - 100 && '5' }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className="thumb thumb--right"
      />

      <div className="slider">
        <div className="slider__track" />
        <div ref={range} className="slider__range" />
      </div>

      <div className="slider__values">
        <div className="slider__value-left">{displayMin}</div>
        <div className="slider__value-right">{displayMax}</div>
      </div>
    </div>
  );
};

export default DualRangeSlider;
