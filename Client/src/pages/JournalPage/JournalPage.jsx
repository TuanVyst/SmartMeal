import { useState, useEffect, useRef, useCallback } from 'react';
import Nutrition from '../nutrition/Nutrition';
import IngredientList from '../food/IngredientList';
import './JournalPage.css';

const SECTIONS = [
  { id: 'diary',  label: 'Nhật ký ăn uống',   icon: '📓' },
  { id: 'lookup', label: 'Tra cứu nguyên liệu', icon: '🥦' },
];

export default function JournalPage() {
  const [activeSection, setActiveSection] = useState('diary');
  const observerRef = useRef(null);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(`journal-section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const options = {
      root: document.querySelector('.main-page-content'),
      rootMargin: '-50px 0px -55% 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id.replace('journal-section-', '');
          setActiveSection(sectionId);
        }
      });
    }, options);

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(`journal-section-${id}`);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="journal-page">

      {/* ── Sticky Anchor Nav ── */}
      <nav className="journal-anchor-nav" aria-label="Điều hướng nhật ký">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`journal-anchor-btn${activeSection === s.id ? ' active' : ''}`}
            onClick={() => scrollToSection(s.id)}
            aria-label={s.label}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1: Nhật ký ăn uống (Nutrition)
         ══════════════════════════════════════════ */}
      <section
        id="journal-section-diary"
        className="journal-section"
      >
        <Nutrition />
      </section>

      {/* ── Divider → Tra cứu ── */}
      <div className="journal-section-divider">
        <div className="journal-divider-icon">🥦</div>
        <div className="journal-divider-text">
          <h2>Tra cứu nguyên liệu</h2>
          <p>Xem chi tiết dinh dưỡng của từng nguyên liệu, tính theo khẩu phần</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2: Tra cứu nguyên liệu (IngredientList)
         ══════════════════════════════════════════ */}
      <section
        id="journal-section-lookup"
        className="journal-section"
      >
        <IngredientList />
      </section>

    </div>
  );
}
