export default function IngredientLockBadge({ ingredient, type }) {
  if (!type) {
    return <span>{ingredient}</span>;
  }

  const badgeConfig = {
    locked: { icon: '🔒', className: 'badge-locked', tooltip: 'Không phù hợp với sức khoẻ của bạn' },
    reduced: { icon: '↓', className: 'badge-reduced', tooltip: 'Đã giảm 50% so với công thức gốc' },
    preferred: { icon: '✓', className: 'badge-preferred', tooltip: 'Nguyên liệu được khuyến nghị' },
  };

  const badge = badgeConfig[type];

  const styles = {
    locked: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    reduced: { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' },
    preferred: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
  };

  return (
    <span
      title={badge.tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 500,
        cursor: 'default',
        ...styles[type],
      }}
    >
      <span>{badge.icon}</span>
      <span>{ingredient}</span>
    </span>
  );
}