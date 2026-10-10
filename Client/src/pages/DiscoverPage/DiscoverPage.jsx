import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Dashboard from '../dashboard/Dashboard';
import MealSuggestion from '../MealSuggestion/MealSuggestion';
import MealPlanSuggestion from '../meal-plan/MealPlanSuggestion';
import { FiLock } from 'react-icons/fi';
import './DiscoverPage.css';

const SECTIONS = [
  { id: 'overview', label: 'Tổng quan',     icon: '🏠', requiresPro: false },
  { id: 'plan',     label: 'Kế hoạch tuần', icon: '📅', requiresPro: true  },
  { id: 'discover', label: 'Khám phá',      icon: '🍽️', requiresPro: false },
];

export default function DiscoverPage() {
  const { isPremium, hasProAccess } = useAuth();
  const canUsePro = isPremium || hasProAccess;
  const [activeSection, setActiveSection] = useState('overview');
  const [isPlanCollapsed, setIsPlanCollapsed] = useState(false);
  const observerRef = useRef(null);
  const navRef = useRef(null);

  // Measure discover-anchor-nav height dynamically and set CSS variable
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const updateNavHeight = () => {
      const height = el.offsetHeight;
      if (height > 0) {
        document.documentElement.style.setProperty('--discover-nav-height', `${height}px`);
      }
    };

    updateNavHeight();
    const resizeObserver = new ResizeObserver(updateNavHeight);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.removeProperty('--discover-nav-height');
    };
  }, []);

  // Cuộn tới section khi click anchor
  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(`discover-section-${id}`);
    if (el) {
      // Nếu nhảy tới Kế hoạch tuần mà đang ẩn thì mở ra
      if (id === 'plan' && isPlanCollapsed) {
        setIsPlanCollapsed(false);
      }
      // Dùng timeout nhỏ để đảm bảo render xong state collapse nếu có
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [isPlanCollapsed]);

  // IntersectionObserver: highlight anchor khi section vào viewport
  useEffect(() => {
    const navHeight = navRef.current?.offsetHeight || 180;
    const options = {
      root: document.querySelector('.main-page-content'), // scroll container của MainLayout
      rootMargin: `-${navHeight + 20}px 0px -55% 0px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id.replace('discover-section-', '');
          setActiveSection(sectionId);
        }
      });
    }, options);

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(`discover-section-${id}`);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="discover-page">

      {/* ══════════════════════════════════════════
          STICKY ANCHOR NAV - Định hướng khi cuộn
         ══════════════════════════════════════════ */}
      <nav ref={navRef} className="discover-anchor-nav" aria-label="Điều hướng nhanh">
        <div className="discover-anchor-tabs">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`discover-anchor-btn${activeSection === s.id ? ' active' : ''}`}
              onClick={() => scrollToSection(s.id)}
              aria-label={s.label}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
              {s.requiresPro && !canUsePro && (
                <span className="pro-lock" title="Tính năng Pro">
                  <FiLock size={9} color={activeSection === s.id ? 'white' : '#94a3b8'} />
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Portal target for nutrition circles */}
        <div id="nutrition-circles-portal-target" className="nutrition-circles-portal"></div>
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1: Tổng quan hôm nay (Dashboard - chỉ còn Hero & Health Tip)
         ══════════════════════════════════════════ */}
      <section
        id="discover-section-overview"
        className="discover-section"
      >
        <Dashboard />
      </section>

      {/* ── Divider → Kế hoạch ── */}
      <div className="discover-section-divider">
        <div className="divider-left">
          <div className="divider-icon">📅</div>
          <div className="divider-text">
            <h2>Kế hoạch tuần</h2>
            <p>Thực đơn AI cá nhân hoá theo mục tiêu sức khoẻ</p>
          </div>
        </div>
        <div className="divider-right">
          {!canUsePro && (
            <div className="divider-badge">
              <FiLock size={11} /> Tính năng Pro
            </div>
          )}
          <button 
            className="divider-toggle-btn"
            onClick={() => setIsPlanCollapsed(!isPlanCollapsed)}
            aria-expanded={!isPlanCollapsed}
          >
            {isPlanCollapsed ? 'Hiện' : 'Ẩn'}
            <span className={`divider-toggle-icon ${isPlanCollapsed ? 'collapsed' : ''}`}>▼</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2: Kế hoạch tuần (MealPlanSuggestion)
         ══════════════════════════════════════════ */}
      <div className={`discover-collapsible ${isPlanCollapsed ? 'collapsed' : ''}`}>
        <section
          id="discover-section-plan"
          className="discover-section"
        >
          <MealPlanSuggestion />
        </section>
      </div>

      {/* ── Divider → Khám phá ── */}
      <div className="discover-section-divider">
        <div className="divider-left">
          <div className="divider-icon">🍽️</div>
          <div className="divider-text">
            <h2>Khám phá món ăn</h2>
            <p>Tìm công thức phù hợp với nguyên liệu bạn có</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 3: Khám phá món ăn (MealSuggestion)
         ══════════════════════════════════════════ */}
      <section
        id="discover-section-discover"
        className="discover-section"
      >
        <MealSuggestion />
      </section>

    </div>
  );
}
