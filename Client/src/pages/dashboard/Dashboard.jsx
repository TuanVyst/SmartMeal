import { useContext, useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HealthProfileContext } from '../../context/HealthProfileContext';
import { nutritionLogService } from '../../services/nutritionLogService';
import heroSaladImg    from '../../assets/hero_salad_bowl.png';
import avocadoMascot   from '../../assets/avocado_mascot.png';
import chickenSalad    from '../../assets/meal_chicken_salad.png';
import salmonImg       from '../../assets/meal_salmon.png';
import smoothieImg     from '../../assets/meal_avocado_smoothie.png';
import './Dashboard.css';

const MEAL_SUGGESTIONS = [
  { id: 1, name: 'Salad ức gà rau củ',      calories: 350, img: chickenSalad, tag: '🥗 Lành mạnh' },
  { id: 2, name: 'Cá hồi áp chảo măng tây', calories: 450, img: salmonImg,    tag: '🐟 Giàu protein' },
  { id: 3, name: 'Sinh tố bơ chuối',         calories: 280, img: smoothieImg,  tag: '🥑 Tốt cho tim' },
  { id: 4, name: 'Salad ức gà rau củ',      calories: 350, img: chickenSalad, tag: '🥗 Lành mạnh' },
  { id: 5, name: 'Sinh tố bơ chuối',         calories: 280, img: smoothieImg,  tag: '🍌 Nhiều năng lượng' },
];

const HABITS = [
  { key: 'water',    icon: '💧', iconClass: 'water',    label: 'Uống đủ nước', current: 6,  target: 8,  unit: 'ly',    pct: 75  },
  { key: 'exercise', icon: '🏃', iconClass: 'exercise', label: 'Tập luyện',    current: 30, target: 60, unit: 'phút',  pct: 50  },
  { key: 'sleep',    icon: '🌙', iconClass: 'sleep',    label: 'Ngủ đủ giấc', current: 7,  target: 8,  unit: 'giờ',   pct: 88 },
];

/* ── Animated progress bar that fires after mount ── */
function AnimatedBar({ pct, className }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="nutrition-progress-bar-wrap">
      <div className={`nutrition-progress-bar ${className}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function AnimatedHabitBar({ pct, className }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 400);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="habit-progress-bar-wrap">
      <div className={`habit-progress-bar ${className}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default function Dashboard() {
  const { user }         = useAuth();
  const healthCtx        = useContext(HealthProfileContext);
  const navigate         = useNavigate();
  const [favs, setFavs]  = useState(new Set([2]));
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const accountId = user?.accountId || user?.account_id;

  useEffect(() => {
    if (accountId) {
      const fetchTodayLogs = async () => {
        try {
          setLoading(true);
          const res = await nutritionLogService.getAll(accountId);
          setNutritionLogs(res.data.data || []);
        } catch (err) {
          console.error("Lỗi khi tải nhật ký dinh dưỡng:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchTodayLogs();
    }
  }, [accountId]);

  if (user?.role === 'Admin') return <Navigate to="/admin" replace />;

  const displayName = user?.username || 'Bạn';

  // Calculate today's totals
  const todayStr = new Date().toISOString().split('T')[0];
  const logsToday = nutritionLogs.filter(log => {
    const logDateStr = log.logDate?.split('T')[0];
    return logDateStr === todayStr;
  });

  const totalsToday = logsToday.reduce((acc, curr) => {
    acc.calories += curr.totalCalories || 0;
    acc.protein += curr.totalProtein || 0;
    acc.carbs += curr.totalCarbs || 0;
    acc.fat += curr.totalFat || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const dailyTargets = healthCtx?.dailyTargets || {
    calories: 2000, protein: 75, carbs: 250, fat: 65
  };

  const caloriesTarget = dailyTargets.calories || 2000;
  const proteinTarget = dailyTargets.protein || 75;
  const carbsTarget = dailyTargets.carbs || 250;
  const fatTarget = dailyTargets.fat || 65;

  const caloriesLeft = Math.max(0, Math.round(caloriesTarget - totalsToday.calories));

  const nutritionData = [
    { key: 'calories',  icon: '🔥', label: 'Calorie nạp vào', value: Math.round(totalsToday.calories),  unit: 'kcal', target: caloriesTarget, pct: Math.min(Math.round((totalsToday.calories / caloriesTarget) * 100), 100) },
    { key: 'protein',   icon: '💪', label: 'Protein',          value: Math.round(totalsToday.protein),   unit: 'g',    target: proteinTarget,  pct: Math.min(Math.round((totalsToday.protein / proteinTarget) * 100), 100) },
    { key: 'carbs',     icon: '🌾', label: 'Carbs',            value: Math.round(totalsToday.carbs),     unit: 'g',    target: carbsTarget,    pct: Math.min(Math.round((totalsToday.carbs / carbsTarget) * 100), 100) },
    { key: 'fat',       icon: '💧', label: 'Chất béo',         value: Math.round(totalsToday.fat),       unit: 'g',    target: fatTarget,      pct: Math.min(Math.round((totalsToday.fat / fatTarget) * 100), 100) },
  ];

  const toggleFav = (id, e) => {
    e.stopPropagation();
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="dashboard-page">

      {/* ══════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════ */}
      <section className="dashboard-hero">
        {/* Floating particles */}
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />

        <div className="hero-left">
          <div className="hero-tag">🌿 Chào mừng trở lại 🌿</div>

          <h1 className="hero-title">
            Xin chào, {displayName}! 👋
          </h1>
          <p className="hero-subtitle">
            Hôm nay là một ngày tuyệt vời để<br />
            chăm sóc bản thân và ăn uống lành mạnh.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-chip">
              <span className="hero-stat-chip-icon">🔥</span>
              <div>
                <div className="hero-stat-chip-value">{caloriesLeft} kcal</div>
                <div className="hero-stat-chip-label">Calorie còn lại</div>
              </div>
            </div>
            <div className="hero-stat-chip">
              <span className="hero-stat-chip-icon">🎯</span>
              <div>
                <div className="hero-stat-chip-value">2/3</div>
                <div className="hero-stat-chip-label">Mục tiêu hôm nay</div>
              </div>
            </div>
          </div>

          <button
            className="hero-cta-btn"
            onClick={() => navigate('/meal-plans')}
          >
            + Lên kế hoạch bữa ăn
          </button>
        </div>

        <div className="hero-right">
          <img
            src={heroSaladImg}
            alt="Healthy salad bowl"
            className="hero-food-img hero-food-img--large"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NUTRITION OVERVIEW
         ══════════════════════════════════════════ */}
      <section>
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">📊 Tổng quan hôm nay</h2>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>🗓 Hôm nay</span>
          </div>
        </div>

        <div className="nutrition-overview-grid">
          {nutritionData.map(n => (
            <div className="nutrition-card" key={n.key}>
              <div className="nutrition-card-top">
                <div className={`nutrition-card-icon ${n.key}`}>{n.icon}</div>
                <div className="nutrition-card-info">
                  <div className="nutrition-card-label">{n.label}</div>
                  <div className="nutrition-card-value">
                    {n.value}
                    <span className="nutrition-card-unit">{n.unit}</span>
                  </div>
                </div>
              </div>
              <AnimatedBar pct={n.pct} className={n.key} />
              <div className="nutrition-card-target">
                Mục tiêu: {n.target} {n.unit}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MEAL RECOMMENDATIONS
         ══════════════════════════════════════════ */}
      <section className="meal-carousel-wrap">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">✨ Gợi ý cho bạn</h2>
          <NavLink to="/meal-suggestions" className="section-see-all">
            Xem tất cả →
          </NavLink>
          <button
            className="hero-cta-btn"
            style={{ fontSize: 13, padding: '6px 14px', marginLeft: 8 }}
            onClick={() => navigate('/recipes/new')}
          >
            + Tạo công thức
          </button>
        </div>

        <div className="meal-cards-scroll">
          {MEAL_SUGGESTIONS.map(meal => (
            <div
              key={meal.id}
              className="meal-card"
              onClick={() => navigate('/meal-suggestions')}
            >
              <div className="meal-card-img-wrap">
                <img src={meal.img} alt={meal.name} className="meal-card-img" />
                <button
                  className={`meal-card-fav-btn${favs.has(meal.id) ? ' active' : ''}`}
                  onClick={e => toggleFav(meal.id, e)}
                >
                  {favs.has(meal.id) ? '❤️' : '🤍'}
                </button>
              </div>
              <div className="meal-card-body">
                <p className="meal-card-name">{meal.name}</p>
                <div className="meal-card-meta">
                  <span className="meal-card-calories">🔥 {meal.calories} kcal</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className="meal-card-tag">{meal.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HABIT TRACKING
         ══════════════════════════════════════════ */}
      <section>
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">🌟 Thói quen của bạn</h2>
        </div>

        <div className="habits-grid">
          {HABITS.map(h => (
            <div className="habit-card" key={h.key}>
              <div className="habit-card-header">
                <div className="habit-card-left">
                  <div className={`habit-card-icon ${h.iconClass}`}>{h.icon}</div>
                  <span className="habit-card-name">{h.label}</span>
                </div>
                <span className="habit-card-progress-text">
                  {h.current}/{h.target} {h.unit}
                </span>
              </div>
              <div className="habit-value-row">
                <span className="habit-value">{h.current}</span>
                <span className="habit-unit">/{h.target} {h.unit}</span>
              </div>
              <AnimatedHabitBar pct={h.pct} className={h.iconClass} />
            </div>
          ))}

          {/* Streak Card */}
          <div className="habit-card streak-card">
            <div className="streak-card-title">🔥 Chuỗi ngày hiện tại</div>
            <div className="streak-card-value">12</div>
            <div className="streak-card-unit">ngày liên tiếp</div>
            <img src={avocadoMascot} alt="mascot" className="streak-mascot" />
          </div>
        </div>
      </section>

    </div>
  );
}
