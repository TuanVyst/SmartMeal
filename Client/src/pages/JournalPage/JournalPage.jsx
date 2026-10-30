import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Nutrition from '../nutrition/Nutrition';
import IngredientList from '../food/IngredientList';
import './JournalPage.css';

const TABS = [
  { id: 'diary',  label: 'Nhật ký ăn uống',   icon: '📓' },
  { id: 'lookup', label: 'Tra cứu nguyên liệu', icon: '🥦' },
];

export default function JournalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'lookup' ? 'lookup' : 'diary';

  // Lazy-mount lookup tab only when first visited
  const [visitedLookup, setVisitedLookup] = useState(activeTab === 'lookup');

  useEffect(() => {
    if (activeTab === 'lookup') {
      setVisitedLookup(true);
    }
  }, [activeTab]);

  useEffect(() => {
    const mainEl = document.querySelector('.main-page-content');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    if (tabId === 'lookup') {
      setSearchParams({ tab: 'lookup' });
    } else {
      setSearchParams({});
    }
    const mainEl = document.querySelector('.main-page-content');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  };
  return (
    <div className="journal-page">

      {/* ── Tabs Navigation ── */}
      <nav className="journal-anchor-nav" aria-label="Điều hướng nhật ký">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`journal-anchor-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => handleTabChange(t.id)}
            aria-label={t.label}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* ══════════════════════════════════════════
          TAB 1: Nhật ký ăn uống (Nutrition)
         ══════════════════════════════════════════ */}
      <div
        id="journal-section-diary"
        className="journal-tab-panel"
        style={{ display: activeTab === 'diary' ? 'block' : 'none' }}
      >
        <Nutrition />
      </div>

      {/* ══════════════════════════════════════════
          TAB 2: Tra cứu nguyên liệu (IngredientList)
         ══════════════════════════════════════════ */}
      {visitedLookup && (
        <div
          id="journal-section-lookup"
          className="journal-tab-panel"
          style={{ display: activeTab === 'lookup' ? 'block' : 'none' }}
        >
          <IngredientList />
        </div>
      )}
    </div>
  );
}
