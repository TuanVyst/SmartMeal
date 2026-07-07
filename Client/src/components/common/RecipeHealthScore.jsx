import { useHealthProfile } from '../../hooks/useHealthProfile';

const BADGE_STYLES = {
  green: {
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    color: 'white',
    border: '1.5px solid #15803d',
    icon: '🟢',
    glow: 'rgba(34,197,94,0.25)',
  },
  yellow: {
    background: 'linear-gradient(135deg, #ca8a04, #eab308)',
    color: 'white',
    border: '1.5px solid #a16207',
    icon: '🟡',
    glow: 'rgba(234,179,8,0.25)',
  },
  red: {
    background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
    color: 'white',
    border: '1.5px solid #991b1b',
    icon: '🔴',
    glow: 'rgba(239,68,68,0.25)',
  },
};

/**
 * Badge hiển thị Health Score nổi bật.
 * Hỗ trợ 2 variant: 'badge' (nhỏ, inline) và 'card' (trên ảnh card).
 */
export default function RecipeHealthScore({ recipe, variant = 'badge' }) {
  const { getHealthScoreDetails, healthProfile } = useHealthProfile();

  if (!healthProfile) return null;

  const { score, badge } = getHealthScoreDetails(recipe);
  const style = BADGE_STYLES[badge.level] || BADGE_STYLES.green;

  if (variant === 'card') {
    // Badge lớn, đặt overlay trên ảnh card
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 10px',
          borderRadius: 20,
          background: style.background,
          border: style.border,
          boxShadow: `0 2px 8px ${style.glow}`,
          color: style.color,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 11 }}>{style.icon}</span>
        <span>{badge.percent}</span>
        <span style={{ fontWeight: 500, opacity: 0.92 }}>{badge.label}</span>
      </div>
    );
  }

  // Default: badge inline nhỏ (dùng ở dưới card)
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 14,
        background: style.background,
        border: style.border,
        boxShadow: `0 1px 6px ${style.glow}`,
        color: style.color,
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 10 }}>{style.icon}</span>
      <span>{badge.percent}</span>
      <span style={{ fontWeight: 500 }}>{badge.label}</span>
    </div>
  );
}