import { useState, useEffect, useCallback, useRef } from 'react';
import { getRecommendation } from '../../utils/recommendationEngine';
import './HealthTipCard.css';

export default function HealthTipCard({ totalsToday, dailyTargets, healthProfile }) {
  const [tip, setTip] = useState(() =>
    getRecommendation({ totalsToday, dailyTargets, healthProfile })
  );
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(false);
  const timerRef = useRef(null);

  const refresh = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setTip(getRecommendation({ totalsToday, dailyTargets, healthProfile }));
      setFading(false);
    }, 400);
  }, [totalsToday, dailyTargets, healthProfile]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) refresh();
    }, 12000);

    return () => clearInterval(timerRef.current);
  }, [refresh]);

  const handleMouseEnter = useCallback(() => { pausedRef.current = true; }, []);
  const handleMouseLeave = useCallback(() => { pausedRef.current = false; }, []);
  const handleTouchStart = useCallback(() => { pausedRef.current = true; }, []);
  const handleTouchEnd = useCallback(() => { pausedRef.current = false; }, []);

  return (
    <div
      className={`health-tip-card health-tip-theme--${tip.theme}${fading ? ' health-tip--fading' : ''}`}
      style={{ background: tip.gradient }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="health-tip-accent" style={{ background: tip.accent }} />
      <div className="health-tip-content">
        <span className="health-tip-label" style={{ color: tip.accent }}>
          {tip.label}
        </span>
        <p className="health-tip-text">{tip.text}</p>
      </div>
    </div>
  );
}
