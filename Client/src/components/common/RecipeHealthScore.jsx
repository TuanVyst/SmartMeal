import { useHealthProfile } from '../../hooks/useHealthProfile';

const BADGE_STYLES = {
  excellent: {
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    color: 'white',
    border: '1.5px solid #15803d',
    icon: '✨',
    glow: 'rgba(34,197,94,0.3)',
  },
  good: {
    background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
    color: 'white',
    border: '1.5px solid #0369a1',
    icon: '👌',
    glow: 'rgba(14,165,233,0.3)',
  },
  fair: {
    background: 'linear-gradient(135deg, #ca8a04, #eab308)',
    color: 'white',
    border: '1.5px solid #a16207',
    icon: '🤔',
    glow: 'rgba(234,179,8,0.3)',
  },
  poor: {
    background: 'linear-gradient(135deg, #ea580c, #f97316)',
    color: 'white',
    border: '1.5px solid #c2410c',
    icon: '⚠️',
    glow: 'rgba(249,115,22,0.3)',
  },
  bad: {
    background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
    color: 'white',
    border: '1.5px solid #991b1b',
    icon: '🚫',
    glow: 'rgba(239,68,68,0.3)',
  },
};

/**
 * Badge hiển thị Health Score nổi bật.
 * Hỗ trợ 2 variant: 'badge' (nhỏ, inline) và 'card' (trên ảnh card).
 */
export default function RecipeHealthScore({ recipe, variant = 'badge' }) {
  const { getHealthScoreDetails, healthProfile } = useHealthProfile();

  const healthDetails = healthProfile ? getHealthScoreDetails(recipe) : null;
  const score = recipe?.healthDetails?.score ?? healthDetails?.score ?? 100;
  const badge = healthDetails?.badge || {
    percent: `${score}/100`,
    label: score >= 85 ? 'Rất phù hợp' : score >= 70 ? 'Phù hợp' : 'Tạm được',
    level: score >= 85 ? 'excellent' : score >= 70 ? 'good' : 'fair'
  };
  const style = BADGE_STYLES[badge.level] || BADGE_STYLES.excellent;

  if (variant === 'compact') {
    return (
      <div
        className="recipe-health-score-badge compact"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          padding: '3px 8px',
          borderRadius: 12,
          background: style.background,
          border: style.border,
          boxShadow: `0 1px 4px ${style.glow}`,
          color: style.color,
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
        title={`Độ phù hợp sức khỏe: ${badge.percent} (${badge.label})`}
      >
        <span style={{ fontSize: 10 }}>{style.icon}</span>
        <span>{badge.percent}</span>
      </div>
    );
  }

  if (variant === 'card') {
    // Badge lớn hoặc trên thẻ card
    return (
      <div
        className="recipe-health-score-badge card-variant"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 16,
          background: style.background,
          border: style.border,
          boxShadow: `0 2px 6px ${style.glow}`,
          color: style.color,
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 10 }}>{style.icon}</span>
        <span>{badge.percent}</span>
        <span className="health-score-label-text" style={{ fontWeight: 500, opacity: 0.95 }}>{badge.label}</span>
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