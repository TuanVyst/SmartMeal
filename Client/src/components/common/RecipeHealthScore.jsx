import { useHealthProfile } from '../../hooks/useHealthProfile';

export default function RecipeHealthScore({ recipe }) {
  const { getHealthScoreForRecipe, healthProfile } = useHealthProfile();

  if (!healthProfile) return null;

  const score = getHealthScoreForRecipe(recipe);

  const config = score >= 80
    ? { icon: <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />, text: 'Rất phù hợp', color: '#16a34a' }
    : score >= 50
      ? { icon: <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ca8a04', display: 'inline-block' }} />, text: 'Phù hợp vừa', color: '#ca8a04' }
      : { icon: <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />, text: 'Ít phù hợp', color: '#dc2626' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 13,
        fontWeight: 500,
        color: config.color,
      }}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
      <span style={{ fontSize: 11, opacity: 0.7 }}>({score}/100)</span>
    </span>
  );
}