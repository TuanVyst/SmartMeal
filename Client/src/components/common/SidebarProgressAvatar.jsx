import { useState, useEffect, useRef, useId } from 'react';
import './SidebarProgressAvatar.css';

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 7;
const INITIAL_ANIMATION_MS = 850;
const UPDATE_ANIMATION_MS = 400;

export default function SidebarProgressAvatar({
  avatarSrc = '',
  initials = '?',
  isPremium = false,
  caloriesToday = 0,
  targetCalories = 2000,
}) {
  const gradientId = useId().replace(/:/g, '');
  const premiumGradientId = `${gradientId}-premium`;

  const targetProgress = targetCalories > 0
    ? Math.min(caloriesToday / targetCalories, 1)
    : 0;

  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pulseComplete, setPulseComplete] = useState(false);
  const isInitialMountRef = useRef(true);
  const wasCompleteRef = useRef(false);

  const percentage = Math.round(targetProgress * 100);
  const isComplete = percentage >= 100;
  const strokeDash = `${CIRCUMFERENCE * animatedProgress} ${CIRCUMFERENCE * (1 - animatedProgress)}`;

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimatedProgress(targetProgress);
        });
      });
      return () => cancelAnimationFrame(frame);
    }

    setIsUpdating(true);
    setAnimatedProgress(targetProgress);

    const timer = setTimeout(() => setIsUpdating(false), UPDATE_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [targetProgress]);

  useEffect(() => {
    if (isComplete && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      setPulseComplete(true);
      const timer = setTimeout(() => setPulseComplete(false), 300);
      return () => clearTimeout(timer);
    }

    if (!isComplete) {
      wasCompleteRef.current = false;
    }
  }, [isComplete]);

  const rootClass = [
    'sidebar-progress-avatar',
    isPremium ? 'sidebar-progress-avatar--premium' : '',
    isComplete ? 'sidebar-progress-avatar--complete' : '',
    pulseComplete ? 'sidebar-progress-avatar--pulse' : '',
  ].filter(Boolean).join(' ');

  const progressClass = [
    'sidebar-progress-avatar__progress',
    isUpdating ? 'sidebar-progress-avatar__progress--updating' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rootClass}
      role="img"
      aria-label={`Hoàn thành mục tiêu hôm nay ${percentage}%`}
      tabIndex={0}
    >
      <div className="sidebar-progress-avatar__tooltip" aria-hidden="true">
        <span className="sidebar-progress-avatar__tooltip-title">
          Hoàn thành mục tiêu hôm nay
        </span>
        <span className="sidebar-progress-avatar__tooltip-value">
          {caloriesToday} / {targetCalories} kcal
        </span>
        <span className="sidebar-progress-avatar__tooltip-pct">
          {percentage}%
        </span>
      </div>

      <svg
        className="sidebar-progress-avatar__ring"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${gradientId}-track`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B6B35" />
            <stop offset="55%" stopColor="#6CCB63" />
            <stop offset="100%" stopColor="#C8F542" />
          </linearGradient>
          <linearGradient id={premiumGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>

        <circle
          className="sidebar-progress-avatar__track"
          cx="36"
          cy="36"
          r={RADIUS}
          stroke={isPremium ? '#fdf6e2' : `url(#${gradientId}-track)`}
          strokeWidth={STROKE_WIDTH}
        />

        <circle
          className={progressClass}
          cx="36"
          cy="36"
          r={RADIUS}
          stroke={isPremium ? `url(#${premiumGradientId})` : `url(#${gradientId})`}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={strokeDash}
          style={{
            transitionDuration: isUpdating
              ? `${UPDATE_ANIMATION_MS}ms`
              : `${INITIAL_ANIMATION_MS}ms`,
          }}
        />
      </svg>

      {avatarSrc ? (
        <img
          className="sidebar-progress-avatar__avatar sidebar-progress-avatar__avatar--image"
          src={avatarSrc}
          alt="Avatar"
        />
      ) : (
        <div className="sidebar-progress-avatar__avatar">
          {initials}
        </div>
      )}
    </div>
  );
}
